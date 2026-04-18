#!/usr/bin/env node

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "fs";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Define paths
const openApiDir = join(projectRoot, "openapi");
const outputDir = join(projectRoot, "src/types/generated");

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created output directory: ${outputDir}`);
}

// Check if OpenAPI directory exists
if (!existsSync(openApiDir)) {
  console.error(`❌ OpenAPI directory not found at: ${openApiDir}`);
  process.exit(1);
}

// Function to get TypeScript filename from OpenAPI filename
function getTypeScriptFilename(openapiFilename) {
  // Remove extension and add .ts
  const nameWithoutExtension = openapiFilename.replace(
    /\.(yaml|yml|json)$/i,
    "",
  );
  return `${nameWithoutExtension}.ts`;
}

// Function to parse OpenAPI spec and extract API information
function parseOpenApiSpec(filePath) {
  try {
    const fileContent = readFileSync(filePath, "utf8");
    let spec;

    if (filePath.endsWith(".json")) {
      spec = JSON.parse(fileContent);
    } else {
      spec = yaml.load(fileContent);
    }

    return spec;
  } catch (error) {
    console.error(`❌ Error parsing OpenAPI spec ${filePath}:`, error.message);
    return null;
  }
}

// Function to convert OpenAPI type to io-ts codec
function openApiTypeToIoTs(schema, _schemaName = "", schemas = {}) {
  if (!schema) return "t.unknown";

  // Handle references
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    const baseCodec = `${refName}Codec`;
    // Check if reference is nullable
    if (schema.nullable) {
      return `t.union([${baseCodec}, t.null])`;
    }
    return baseCodec;
  }

  // Handle arrays
  if (schema.type === "array") {
    const itemsCodec = openApiTypeToIoTs(schema.items, "", schemas);
    const baseCodec = `t.array(${itemsCodec})`;
    // Check if array is nullable
    if (schema.nullable) {
      return `t.union([${baseCodec}, t.null])`;
    }
    return baseCodec;
  }

  // Handle objects
  if (schema.type === "object" || schema.properties) {
    const properties = schema.properties || {};
    const required = schema.required || [];

    const props = Object.entries(properties)
      .map(([propName, propSchema]) => {
        const propCodec = openApiTypeToIoTs(propSchema, "", schemas);
        return `  ${propName}: ${propCodec}`;
      })
      .join(",\n");

    if (Object.keys(properties).length === 0) {
      return "t.record(t.string, t.unknown)";
    }

    // Use t.partial for optional properties, t.type for required ones
    const hasOptional = Object.keys(properties).some(
      (prop) => !required.includes(prop),
    );
    const hasRequired = Object.keys(properties).some((prop) =>
      required.includes(prop),
    );

    let baseCodec;
    if (hasOptional && !hasRequired) {
      baseCodec = `t.partial({\n${props}\n})`;
    } else if (!hasOptional && hasRequired) {
      baseCodec = `t.type({\n${props}\n})`;
    } else {
      // Mixed required/optional - use intersection
      const requiredProps = Object.entries(properties)
        .filter(([prop]) => required.includes(prop))
        .map(([propName, propSchema]) => {
          const propCodec = openApiTypeToIoTs(propSchema, "", schemas);
          return `  ${propName}: ${propCodec}`;
        })
        .join(",\n");

      const optionalProps = Object.entries(properties)
        .filter(([prop]) => !required.includes(prop))
        .map(([propName, propSchema]) => {
          const propCodec = openApiTypeToIoTs(propSchema, "", schemas);
          return `  ${propName}: ${propCodec}`;
        })
        .join(",\n");

      baseCodec = `t.intersection([
  t.type({\n${requiredProps}\n}),
  t.partial({\n${optionalProps}\n})
])`;
    }

    // Check if object is nullable
    if (schema.nullable) {
      return `t.union([${baseCodec}, t.null])`;
    }
    return baseCodec;
  }

  // Handle primitive types
  let baseCodec;
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        baseCodec = `t.keyof({ ${schema.enum.map((val) => `"${val}": null`).join(", ")} })`;
      } else {
        baseCodec = "t.string";
      }
      break;
    case "number":
    case "integer":
      baseCodec = "t.number";
      break;
    case "boolean":
      baseCodec = "t.boolean";
      break;
    case "null":
      return "t.null";
    default:
      baseCodec = "t.unknown";
  }

  // Check if primitive type is nullable
  if (schema.nullable) {
    return `t.union([${baseCodec}, t.null])`;
  }
  return baseCodec;
}

// Function to find dependencies of a schema
function findSchemaDependencies(schema, allSchemas, visited = new Set()) {
  if (!schema || visited.has(schema)) return [];
  visited.add(schema);

  const deps = [];

  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    if (allSchemas[refName]) {
      deps.push(refName);
      deps.push(
        ...findSchemaDependencies(allSchemas[refName], allSchemas, visited),
      );
    }
  }

  if (schema.type === "array" && schema.items) {
    deps.push(...findSchemaDependencies(schema.items, allSchemas, visited));
  }

  if (schema.properties) {
    Object.values(schema.properties).forEach((prop) => {
      deps.push(...findSchemaDependencies(prop, allSchemas, visited));
    });
  }

  return [...new Set(deps)]; // Remove duplicates
}

// Function to topologically sort schemas by dependencies
function topologicalSort(schemas) {
  const sorted = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(schemaName) {
    if (visiting.has(schemaName)) {
      // Circular dependency - just continue
      return;
    }
    if (visited.has(schemaName)) {
      return;
    }

    visiting.add(schemaName);

    const deps = findSchemaDependencies(schemas[schemaName], schemas);
    deps.forEach((dep) => {
      if (schemas[dep]) {
        visit(dep);
      }
    });

    visiting.delete(schemaName);
    visited.add(schemaName);
    sorted.push(schemaName);
  }

  Object.keys(schemas).forEach((schemaName) => {
    visit(schemaName);
  });

  return sorted;
}

// Function to generate io-ts codecs from OpenAPI schemas
function generateIoTsCodecs(spec) {
  if (!spec.components || !spec.components.schemas) {
    return "";
  }

  const schemas = spec.components.schemas;
  let codecsContent = "";

  // Sort schemas by dependencies to avoid forward reference issues
  const sortedSchemas = topologicalSort(schemas);

  // Generate codecs in dependency order
  sortedSchemas.forEach((schemaName) => {
    const schema = schemas[schemaName];
    const codec = openApiTypeToIoTs(schema, schemaName, schemas);
    codecsContent += `export const ${schemaName}Codec = ${codec};\n`;
    codecsContent += `export type ${schemaName}Type = t.TypeOf<typeof ${schemaName}Codec>;\n\n`;
  });

  return codecsContent;
}

// Function to generate schema definitions for validation error messages
function generateSchemaDefinitions(spec) {
  if (!spec.components || !spec.components.schemas) {
    return "";
  }

  const schemas = spec.components.schemas;

  // Build the schema definitions object
  const schemaDefinitions = {};

  Object.entries(schemas).forEach(([schemaName, schema]) => {
    const required = schema.required || [];
    const properties = schema.properties || {};

    const propertiesObject = {};
    Object.entries(properties).forEach(([propName, propSchema]) => {
      const propType = propSchema.type || "unknown";
      const description = propSchema.description || "";
      propertiesObject[propName] = { type: propType };
      if (description) {
        propertiesObject[propName].description = description;
      }
    });

    schemaDefinitions[schemaName] = {
      name: schemaName,
      type: schema.type || "object",
      required: required,
      properties: propertiesObject,
    };

    if (schema.example) {
      schemaDefinitions[schemaName].example = schema.example;
    }
  });

  // Auto-generate endpoint mappings from OpenAPI spec
  const endpointSchemaMap = {};
  const validatorMap = {};

  // Extract base path from server URL
  let basePath = "";
  if (spec.servers && spec.servers.length > 0) {
    const serverUrl = spec.servers[0].url;
    const urlParts = new URL(serverUrl);
    basePath = urlParts.pathname.replace(/\/$/, ""); // Remove trailing slash
  }

  if (spec.paths) {
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (
          ["get", "post", "put", "delete", "patch"].includes(
            method.toLowerCase(),
          )
        ) {
          const responses = operation.responses || {};
          const successResponse = responses["200"] || responses["201"];

          if (successResponse?.content?.["application/json"]?.schema) {
            const schema = successResponse.content["application/json"].schema;
            let schemaName = null;
            let isArray = false;

            if (schema.$ref) {
              schemaName = schema.$ref.split("/").pop();
            } else if (schema.type === "array" && schema.items?.$ref) {
              schemaName = schema.items.$ref.split("/").pop();
              isArray = true;
            }

            if (schemaName) {
              // Include base path in the key to match actual API calls
              const fullPath = basePath + path;
              const key = `${method.toUpperCase()} ${fullPath}`;
              endpointSchemaMap[key] = { schema: schemaName, isArray };

              // Generate validator name from operation ID or path
              const operationId = operation.operationId;
              if (operationId) {
                const validatorName = `${operationId.charAt(0).toUpperCase()}${operationId.slice(1)}ResponseValidator`;
                validatorMap[key] = validatorName;
              }
            }
          }
        }
      });
    });
  }

  return `
// ============================================================================
// SCHEMA DEFINITIONS FOR VALIDATION ERRORS
// ============================================================================

interface SchemaInfo {
  name: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'integer';
  required: string[];
  properties: Record<string, { 
    type: string; 
    description?: string;
    items?: {
      $ref: string;
    };
    enum?: string[];
  }>;
  example?: any;
}

export const SCHEMA_DEFINITIONS: Record<string, SchemaInfo> = ${JSON.stringify(schemaDefinitions, null, 2)};

export const ENDPOINT_SCHEMA_MAP: Record<string, { schema: string; isArray: boolean }> = ${JSON.stringify(endpointSchemaMap, null, 2)};

export const VALIDATOR_MAP: Record<string, string> = ${JSON.stringify(validatorMap, null, 2)};

// Get validator for method + path combination
export const getValidatorForEndpoint = (method: string, path: string): any => {
  const key = \`\${method.toUpperCase()} \${path}\`;
  const validatorName = VALIDATOR_MAP[key];
  
  if (!validatorName) {
    console.warn(\`No validator found for \${key}\`);
    return undefined;
  }
  
  // This will be replaced by actual validator imports in the generated file
  return eval(validatorName);
};

// Get expected schema type for an endpoint (supports both old format and new method+path format)
export const getExpectedSchemaType = (endpointOrMethod?: string, path?: string): string => {
  let key: string;
  
  if (path) {
    // New format: method and path separate
    key = \`\${endpointOrMethod?.toUpperCase()} \${path}\`;
  } else {
    // Old format: try to find matching path or use as-is
    key = endpointOrMethod || '';
    // Check if it's already in the map
    if (!ENDPOINT_SCHEMA_MAP[key]) {
      // Try to find by path only (for backward compatibility)
      const matchingKey = Object.keys(ENDPOINT_SCHEMA_MAP).find(k => k.includes(key));
      if (matchingKey) {
        key = matchingKey;
      }
    }
  }
  
  if (!key) return 'Unknown endpoint';
  
  const mapping = ENDPOINT_SCHEMA_MAP[key];
  if (!mapping) return \`Unknown schema for \${key}\`;
  
  return mapping.isArray ? \`Array<\${mapping.schema}>\` : mapping.schema;
};

// Get detailed schema requirements from OpenAPI spec
export const getSchemaRequirements = (endpointOrMethod?: string, path?: string): string => {
  let key: string;
  
  if (path) {
    key = \`\${endpointOrMethod?.toUpperCase()} \${path}\`;
  } else {
    key = endpointOrMethod || '';
    if (!ENDPOINT_SCHEMA_MAP[key]) {
      const matchingKey = Object.keys(ENDPOINT_SCHEMA_MAP).find(k => k.includes(key));
      if (matchingKey) {
        key = matchingKey;
      }
    }
  }
  
  if (!key) return 'Unknown endpoint requirements';
  
  const mapping = ENDPOINT_SCHEMA_MAP[key];
  if (!mapping) return \`No schema mapping found for \${key}\`;
  
  const schemaDef = SCHEMA_DEFINITIONS[mapping.schema];
  if (!schemaDef) return \`Schema definition '\${mapping.schema}' not found\`;
  
  let requirements = \`📋 OpenAPI Schema: \${mapping.isArray ? \`Array<\${schemaDef.name}>\` : schemaDef.name}\\n\`;
  requirements += \`🔧 Type: \${mapping.isArray ? 'array' : schemaDef.type}\\n\`;
  
  if (mapping.isArray) {
    requirements += \`📝 Array Item Schema (\${schemaDef.name}):\\n\`;
  }
  
  requirements += \`✅ Required fields: [\${schemaDef.required.join(', ')}]\\n\`;
  
  if (Object.keys(schemaDef.properties).length > 0) {
    requirements += \`📝 Properties:\\n\`;
    Object.entries(schemaDef.properties).forEach(([key, prop]) => {
      const isRequired = schemaDef.required.includes(key);
      const description = prop.description ? \` - \${prop.description}\` : '';
      requirements += \`   \${isRequired ? '🔸' : '◦'} \${key}: \${prop.type}\${description}\\n\`;
    });
  }
  
  // Smart handling for response schemas with data arrays
  if (schemaDef.properties.data && schemaDef.properties.data.type === 'array') {
    // Try to find the correct array item schema name based on the response schema name
    let dataArrayItemSchema = null;
    
    // Smart mapping: MerchantSummaryResponse -> MerchantSummaryData
    if (mapping.schema.includes('Response')) {
      const baseSchemaName = mapping.schema.replace('Response', 'Data');
      dataArrayItemSchema = SCHEMA_DEFINITIONS[baseSchemaName];
    }
    
    // Fallback: look for schemas that logically match the response
    if (!dataArrayItemSchema) {
      const responseBaseName = mapping.schema.replace(/Response$/, '');
      dataArrayItemSchema = Object.values(SCHEMA_DEFINITIONS).find(schema => 
        schema.name.startsWith(responseBaseName) && schema.name.endsWith('Data')
      );
    }
    
    // Final fallback: any schema ending with 'Data' that's not the current schema
    if (!dataArrayItemSchema) {
      dataArrayItemSchema = Object.values(SCHEMA_DEFINITIONS).find(schema => 
        schema.name.endsWith('Data') && schema.name !== mapping.schema
      );
    }
    
    if (dataArrayItemSchema) {
      requirements += \`\\n🔗 Data Array Items (\${dataArrayItemSchema.name}):\\n\`;
      requirements += \`✅ Required: [\${dataArrayItemSchema.required.join(', ')}]\\n\`;
      Object.entries(dataArrayItemSchema.properties).forEach(([key, prop]) => {
        const isRequired = dataArrayItemSchema.required.includes(key);
        const description = prop.description ? \` - \${prop.description}\` : '';
        requirements += \`   \${isRequired ? '🔸' : '◦'} \${key}: \${prop.type}\${description}\\n\`;
      });
    }
  }
  
  return requirements;
};

// Get a readable description of what went wrong
export const getValidationErrorContext = (endpointOrMethod?: string, pathOrData?: any, actualData?: any): string => {
  let key: string;
  let dataToAnalyze: any;
  
  // Handle both old format (endpoint, data) and new format (method, path, data)
  if (actualData !== undefined) {
    // New format: method, path, data
    key = \`\${endpointOrMethod?.toUpperCase()} \${pathOrData}\`;
    dataToAnalyze = actualData;
  } else {
    // Old format: endpoint, data
    key = endpointOrMethod || '';
    dataToAnalyze = pathOrData;
    
    if (!ENDPOINT_SCHEMA_MAP[key]) {
      const matchingKey = Object.keys(ENDPOINT_SCHEMA_MAP).find(k => k.includes(key));
      if (matchingKey) {
        key = matchingKey;
      }
    }
  }
  
  if (!key || !dataToAnalyze) return '';
  
  const mapping = ENDPOINT_SCHEMA_MAP[key];
  if (!mapping) return '';
  
  const schemaDef = SCHEMA_DEFINITIONS[mapping.schema];
  if (!schemaDef) return '';
  
  let context = \`🔍 Validation Analysis:\\n\`;
  
  // Check if it's an array when it should be
  if (mapping.isArray && !Array.isArray(dataToAnalyze)) {
    context += \`❌ Expected array but got \${typeof dataToAnalyze}\\n\`;
    return context;
  }
  
  const dataToCheck = mapping.isArray ? (Array.isArray(dataToAnalyze) ? dataToAnalyze[0] : {}) : dataToAnalyze;
  if (!dataToCheck || typeof dataToCheck !== 'object') {
    context += \`❌ Expected object but got \${typeof dataToCheck}\\n\`;
    return context;
  }
  
  // Check for missing required fields
  const missingFields = schemaDef.required.filter(field => !(field in dataToCheck));
  if (missingFields.length > 0) {
    context += \`❌ Missing required fields: [\${missingFields.join(', ')}]\\n\`;
  }
  
  // Check for extra fields
  const actualFields = Object.keys(dataToCheck);
  const expectedFields = Object.keys(schemaDef.properties);
  const extraFields = actualFields.filter(field => !expectedFields.includes(field));
  if (extraFields.length > 0) {
    context += \`⚠️ Unexpected fields: [\${extraFields.join(', ')}]\\n\`;
  }
  
  // Check for type mismatches in actual data
  expectedFields.forEach(field => {
    if (field in dataToCheck) {
      const expectedType = schemaDef.properties[field]?.type;
      const actualType = typeof dataToCheck[field];
      const actualValue = dataToCheck[field];
      
      if (expectedType === 'number' && actualType !== 'number') {
        context += \`❌ Field '\${field}': expected number but got \${actualType} (\${JSON.stringify(actualValue)})\\n\`;
      } else if (expectedType === 'string' && actualType !== 'string') {
        context += \`❌ Field '\${field}': expected string but got \${actualType} (\${JSON.stringify(actualValue)})\\n\`;
      } else if (expectedType === 'array' && !Array.isArray(actualValue)) {
        context += \`❌ Field '\${field}': expected array but got \${actualType}\\n\`;
      }
    }
  });
  
  // Smart validation for response schemas with data arrays
  if (schemaDef.properties.data && 'data' in dataToCheck && Array.isArray(dataToCheck.data)) {
    // Try to find the correct array item schema name based on the response schema name
    let dataArrayItemSchema = null;
    
    // Smart mapping: MerchantSummaryResponse -> MerchantSummaryData
    if (mapping.schema.includes('Response')) {
      const baseSchemaName = mapping.schema.replace('Response', 'Data');
      dataArrayItemSchema = SCHEMA_DEFINITIONS[baseSchemaName];
    }
    
    // Fallback: look for schemas that logically match the response
    if (!dataArrayItemSchema) {
      const responseBaseName = mapping.schema.replace(/Response$/, '');
      dataArrayItemSchema = Object.values(SCHEMA_DEFINITIONS).find(schema => 
        schema.name.startsWith(responseBaseName) && schema.name.endsWith('Data')
      );
    }
    
    // Final fallback: any schema ending with 'Data' that's not the current schema
    if (!dataArrayItemSchema) {
      dataArrayItemSchema = Object.values(SCHEMA_DEFINITIONS).find(schema => 
        schema.name.endsWith('Data') && schema.name !== mapping.schema
      );
    }
    
    if (dataArrayItemSchema && dataToCheck.data.length > 0) {
      const firstDataItem = dataToCheck.data[0];
      const missingDataFields = dataArrayItemSchema.required.filter(field => !(field in firstDataItem));
      if (missingDataFields.length > 0) {
        context += \`❌ Data array items missing required fields: [\${missingDataFields.join(', ')}]\\n\`;
      }
    }
  }
  
  return context;
};
`;
}

// Function to generate runtime validation helpers
function generateRuntimeValidationHelpers() {
  return `
// Runtime validation helpers
export function validateResponse<T>(codec: t.Type<T>, data: unknown): T {
  const result = codec.decode(data);
  if (isLeft(result)) {
    const errors = PathReporter.report(result);
    throw new Error(\`Runtime validation failed: \${errors.join(', ')}\`);
  }
  return result.right;
}

export function safeValidateResponse<T>(codec: t.Type<T>, data: unknown): Either<string[], T> {
  const result = codec.decode(data);
  if (isLeft(result)) {
    return left(PathReporter.report(result));
  }
  return right(result.right);
}

// API response validators
export const createApiValidator = <T>(codec: t.Type<T>) => {
  return {
    validate: (data: unknown): T => validateResponse(codec, data),
    safeValidate: (data: unknown): Either<string[], T> => safeValidateResponse(codec, data)
  };
};
`;
}

// Function to generate API types from OpenAPI spec (all CRUD operations)
function generateApiTypes(spec, _baseFilename) {
  const apis = [];

  if (!spec.paths) {
    return apis;
  }

  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      // Handle all HTTP methods
      const httpMethods = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "head",
        "options",
      ];
      if (httpMethods.includes(method.toLowerCase())) {
        const apiInfo = {
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          tags: operation.tags || [],
          parameters: operation.parameters || [],
          requestBody: operation.requestBody,
          responses: operation.responses || {},
        };

        apis.push(apiInfo);
      }
    });
  });

  return apis;
}

// Function to extract schema reference name
function extractSchemaName(schemaRef) {
  if (
    typeof schemaRef === "string" &&
    schemaRef.startsWith("#/components/schemas/")
  ) {
    return schemaRef.split("/").pop();
  }
  return null;
}

// Function to generate request body type
function generateRequestBodyType(requestBody, _operationName) {
  if (!requestBody) return null;

  const content = requestBody.content;
  if (!content) return null;

  // Handle different content types
  const jsonContent = content["application/json"];
  const formContent = content["application/x-www-form-urlencoded"];
  const multipartContent = content["multipart/form-data"];

  let typeDefinition = "";

  if (jsonContent?.schema) {
    const schema = jsonContent.schema;

    if (schema.$ref) {
      const schemaName = extractSchemaName(schema.$ref);
      if (schemaName) {
        typeDefinition = schemaName;
      }
    } else if (schema.type === "object") {
      if (schema.properties) {
        typeDefinition = generateInlineObjectType(schema);
      } else {
        typeDefinition = "Record<string, any>";
      }
    } else if (schema.type === "array") {
      if (schema.items?.$ref) {
        const itemSchemaName = extractSchemaName(schema.items.$ref);
        typeDefinition = itemSchemaName ? `${itemSchemaName}[]` : "any[]";
      } else {
        typeDefinition = "any[]";
      }
    } else {
      typeDefinition = "any";
    }
  } else if (formContent?.schema || multipartContent?.schema) {
    typeDefinition = "FormData | Record<string, any>";
  } else {
    typeDefinition = "any";
  }

  return typeDefinition;
}

// Function to generate inline object type from schema
function generateInlineObjectType(schema) {
  if (!schema.properties) return "Record<string, any>";

  const properties = Object.entries(schema.properties)
    .map(([key, prop]) => {
      const optional = schema.required?.includes(key) ? "" : "?";
      let type = "any";

      if (prop.$ref) {
        const schemaName = extractSchemaName(prop.$ref);
        type = schemaName ? schemaName : "any";
      } else if (prop.type) {
        switch (prop.type) {
          case "string":
            type = "string";
            break;
          case "number":
          case "integer":
            type = "number";
            break;
          case "boolean":
            type = "boolean";
            break;
          case "array":
            if (prop.items?.$ref) {
              const itemSchemaName = extractSchemaName(prop.items.$ref);
              type = itemSchemaName ? `${itemSchemaName}[]` : "any[]";
            } else {
              type = "any[]";
            }
            break;
          case "object":
            type = "Record<string, any>";
            break;
        }
      }

      return `  ${key}${optional}: ${type};`;
    })
    .join("\n");

  return `{\n${properties}\n}`;
}

// Function to generate response type
function generateResponseType(responses, _operationName) {
  const successResponses = Object.entries(responses).filter(
    ([code]) => code.startsWith("2"), // 2xx status codes
  );

  if (successResponses.length === 0) {
    return "any";
  }

  // Use the first success response (usually 200 or 201)
  const [, response] = successResponses[0];
  const jsonContent = response.content?.["application/json"];

  if (!jsonContent?.schema) {
    return "any";
  }

  const schema = jsonContent.schema;

  if (schema.$ref) {
    const schemaName = extractSchemaName(schema.$ref);
    return schemaName ? schemaName : "any";
  } else if (schema.type === "array") {
    if (schema.items?.$ref) {
      const itemSchemaName = extractSchemaName(schema.items.$ref);
      return itemSchemaName ? `${itemSchemaName}[]` : "any[]";
    } else {
      return "any[]";
    }
  } else if (schema.type === "object") {
    return generateInlineObjectType(schema);
  } else {
    return "any";
  }
}

// Function to extract schema names from OpenAPI spec
function extractSchemaNames(spec) {
  const schemaNames = [];
  if (spec?.components?.schemas) {
    Object.keys(spec.components.schemas).forEach((schemaName) => {
      schemaNames.push(schemaName);
    });
  }
  return schemaNames;
}

// Function to generate clean payload and response types
function generateCleanApiTypes(apis, baseFilename, baseTypesContent, spec) {
  let content = `// Auto-generated API Payload & Response Types from ${baseFilename}
// Generated on: ${new Date().toISOString()}

// ============================================================================
// IMPORTS
// ============================================================================

import * as t from 'io-ts';
import { isLeft, left, right } from 'fp-ts/Either';
import type { Either } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/PathReporter';

// ============================================================================
// BASE OPENAPI TYPES
// ============================================================================

${baseTypesContent}

// ============================================================================
// DIRECT SCHEMA EXPORTS (for easier importing)
// ============================================================================

`;

  // First, collect all operation type names to avoid conflicts
  const operationTypeNames = new Set();
  apis.forEach((api) => {
    const operationName =
      api.operationId ||
      `${api.method.toLowerCase()}${api.path.replace(/[^a-zA-Z0-9]/g, "")}`;
    const pascalCaseName = operationName
      .replace(/[^a-zA-Z0-9]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    operationTypeNames.add(`${pascalCaseName}Response`);
    operationTypeNames.add(`${pascalCaseName}Request`);
  });

  // Generate direct exports for all schemas, but skip ones that conflict with operation types
  const schemaNames = extractSchemaNames(spec);
  schemaNames.forEach((schemaName) => {
    // Skip if this schema name conflicts with an operation type that will be generated later
    if (!operationTypeNames.has(schemaName)) {
      content += `export type ${schemaName} = components['schemas']['${schemaName}'];\n`;
    }
  });

  content += `
// ============================================================================
// IO-TS RUNTIME VALIDATION CODECS
// ============================================================================

${generateIoTsCodecs(spec)}

${generateSchemaDefinitions(spec)}

// ============================================================================
// RUNTIME VALIDATION HELPERS
// ============================================================================

${generateRuntimeValidationHelpers()}

// ============================================================================
// API PAYLOAD & RESPONSE TYPES
// ============================================================================

`;

  // Group APIs by operation name for better organization
  const operationGroups = new Map();

  apis.forEach((api) => {
    const operationName =
      api.operationId ||
      `${api.method.toLowerCase()}${api.path.replace(/[^a-zA-Z0-9]/g, "")}`;

    if (!operationGroups.has(operationName)) {
      operationGroups.set(operationName, []);
    }
    operationGroups.get(operationName).push(api);
  });

  // Generate types for each operation
  operationGroups.forEach((apiGroup, operationName) => {
    const pascalCaseName =
      operationName.charAt(0).toUpperCase() + operationName.slice(1);
    const api = apiGroup[0]; // Use first API in group for metadata

    content += `// ${pascalCaseName} - ${api.method} ${api.path}\n`;
    if (api.summary) {
      content += `// ${api.summary}\n`;
    }

    // Generate path parameters type
    const pathParams = api.parameters?.filter((p) => p.in === "path") || [];
    const queryParams = api.parameters?.filter((p) => p.in === "query") || [];
    const headerParams = api.parameters?.filter((p) => p.in === "header") || [];

    // Generate request payload interface
    const requestParts = [];

    if (pathParams.length > 0) {
      content += `export interface ${pascalCaseName}PathParams {\n`;
      pathParams.forEach((param) => {
        const required = param.required ? "" : "?";
        const description = param.description ? ` // ${param.description}` : "";
        const type =
          param.schema?.type === "number" || param.schema?.type === "integer"
            ? "number"
            : "string";
        content += `  ${param.name}${required}: ${type};${description}\n`;
      });
      content += `}\n\n`;
      requestParts.push(`pathParams: ${pascalCaseName}PathParams`);
    }

    if (queryParams.length > 0) {
      content += `export interface ${pascalCaseName}QueryParams {\n`;
      queryParams.forEach((param) => {
        const required = param.required ? "" : "?";
        const description = param.description ? ` // ${param.description}` : "";
        let type = "string";

        if (
          param.schema?.type === "number" ||
          param.schema?.type === "integer"
        ) {
          type = "number";
        } else if (param.schema?.type === "boolean") {
          type = "boolean";
        } else if (param.schema?.type === "array") {
          type = "string[]";
        }

        content += `  ${param.name}${required}: ${type};${description}\n`;
      });
      content += `}\n\n`;
      requestParts.push(`queryParams?: ${pascalCaseName}QueryParams`);
    }

    if (headerParams.length > 0) {
      content += `export interface ${pascalCaseName}HeaderParams {\n`;
      headerParams.forEach((param) => {
        const required = param.required ? "" : "?";
        const description = param.description ? ` // ${param.description}` : "";
        content += `  ${param.name}${required}: string;${description}\n`;
      });
      content += `}\n\n`;
      requestParts.push(`headerParams?: ${pascalCaseName}HeaderParams`);
    }

    // Generate request body type
    const requestBodyType = generateRequestBodyType(
      api.requestBody,
      operationName,
    );
    if (requestBodyType) {
      // Avoid circular reference: check if payload type name would be same as request body type
      const payloadTypeName = `${pascalCaseName}Payload`;
      if (payloadTypeName === requestBodyType) {
        // Use the existing schema type directly instead of creating a duplicate
        requestParts.push(`payload: ${requestBodyType}`);
      } else {
        // Check if the requestBodyType was skipped from schema exports
        if (operationTypeNames.has(requestBodyType)) {
          // Use the Type version instead
          content += `export type ${payloadTypeName} = ${requestBodyType}Type;\n\n`;
        } else {
          content += `export type ${payloadTypeName} = ${requestBodyType};\n\n`;
        }
        requestParts.push(`payload: ${payloadTypeName}`);
      }
    }

    // Generate complete request interface if there are any request parts
    if (requestParts.length > 0) {
      const requestTypeName = `${pascalCaseName}Request`;

      // Only generate if it doesn't conflict with schema exports
      if (!operationTypeNames.has(requestTypeName)) {
        content += `export interface ${requestTypeName} {\n`;
        requestParts.forEach((part) => {
          content += `  ${part};\n`;
        });
        content += `}\n\n`;
      } else {
        // Add comment explaining the type is available from schema exports
        content += `// ${requestTypeName} type is available from schema exports above\n\n`;
      }
    }

    // Generate response type - avoid circular references
    const responseType = generateResponseType(api.responses, operationName);
    const responseTypeName = `${pascalCaseName}Response`;

    // Only generate if it won't create a circular reference or conflict
    if (
      responseType !== responseTypeName &&
      !responseType.includes(responseTypeName)
    ) {
      content += `export type ${responseTypeName} = ${responseType};\n\n`;
    } else {
      // Add comment explaining the type is available from schema exports
      content += `// ${responseTypeName} type is available from schema exports above\n\n`;
    }
  });

  // Generate API validators
  content += `
// ============================================================================
// API RESPONSE VALIDATORS
// ============================================================================

`;

  operationGroups.forEach((apiGroup, operationName) => {
    const pascalCaseName =
      operationName.charAt(0).toUpperCase() + operationName.slice(1);
    const api = apiGroup[0];
    const responseType = generateResponseType(api.responses, operationName);

    // Only generate validator if we have a concrete schema type
    if (responseType && responseType !== "any" && !responseType.includes("{")) {
      const codecName = responseType.replace("[]", "");
      if (schemaNames.includes(codecName)) {
        const isArray = responseType.endsWith("[]");
        const codecRef = isArray
          ? `t.array(${codecName}Codec)`
          : `${codecName}Codec`;

        content += `export const ${pascalCaseName}ResponseValidator = createApiValidator(${codecRef});\n`;
      }
    }
  });

  content += `
// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// In your API client:
import { SaveChartSettingsResponseValidator } from './generated-types';

// Validate API response at runtime
try {
  const validatedResponse = SaveChartSettingsResponseValidator.validate(apiResponse);
  // validatedResponse is now guaranteed to match the schema
} catch (error) {
  console.error('API response validation failed:', error.message);
}

// Or use safe validation that returns Either
const result = SaveChartSettingsResponseValidator.safeValidate(apiResponse);
if (isLeft(result)) {
  console.error('Validation errors:', result.left);
} else {
  const validatedResponse = result.right;
  // Use validatedResponse safely
}
*/
`;

  return content;
}

// Function to process a single OpenAPI file
function processOpenApiFile(filename) {
  const inputPath = join(openApiDir, filename);
  const outputFilename = getTypeScriptFilename(filename);
  const outputPath = join(outputDir, outputFilename);

  console.log(`\n🔄 Processing: ${filename}`);
  console.log(`📁 Input: ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);

  try {
    // Generate base types using openapi-typescript to a temporary location
    const tempDir = join(outputDir, "temp");
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = join(tempDir, outputFilename);
    const command = `npx openapi-typescript "${inputPath}" --output "${tempPath}"`;

    console.log("🔧 Generating base OpenAPI types...");
    execSync(command, {
      stdio: "pipe",
      cwd: projectRoot,
    });

    // Read the generated base types
    const baseTypesContent = readFileSync(tempPath, "utf8");

    // Parse OpenAPI spec and generate API types
    const spec = parseOpenApiSpec(inputPath);
    let apis = [];
    let methodCounts = {};

    if (spec) {
      apis = generateApiTypes(spec, filename);
      console.log(`🔍 Found ${apis.length} API endpoint(s)`);

      methodCounts = apis.reduce((acc, api) => {
        acc[api.method] = (acc[api.method] || 0) + 1;
        return acc;
      }, {});

      console.log(
        `📊 Method breakdown: ${Object.entries(methodCounts)
          .map(([method, count]) => `${method}(${count})`)
          .join(", ")}`,
      );

      if (apis.length > 0) {
        const cleanTypesContent = generateCleanApiTypes(
          apis,
          filename,
          baseTypesContent,
          spec,
        );
        writeFileSync(outputPath, cleanTypesContent, "utf8");
        console.log(
          `✅ Generated clean payload & response types: ${outputFilename}`,
        );
      }
    }

    // Clean up temporary files
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    console.log(`✅ Completed processing ${filename}`);

    return {
      success: true,
      input: filename,
      output: outputFilename,
      apiCount: apis.length,
      methodCounts,
    };
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return { success: false, input: filename, error: error.message };
  }
}

// Main execution block
try {
  console.log("🚀 Generating clean API payload & response types...");
  console.log(`📂 Scanning directory: ${openApiDir}`);

  // Read all files from openapi directory
  const files = readdirSync(openApiDir).filter((file) => {
    const filePath = join(openApiDir, file);
    const stat = statSync(filePath);

    // Only process files (not directories) with OpenAPI extensions
    return stat.isFile() && /\.(yaml|yml|json)$/i.test(file);
  });

  if (files.length === 0) {
    console.log(
      "⚠️  No OpenAPI specification files found in the openapi directory.",
    );
    console.log("   Supported extensions: .yaml, .yml, .json");
    process.exit(0);
  }

  console.log(`📋 Found ${files.length} OpenAPI file(s): ${files.join(", ")}`);

  const results = [];

  // Process each file
  files.forEach((file) => {
    const result = processOpenApiFile(file);
    results.push(result);
  });

  // Summary
  console.log("\n📊 Generation Summary:");
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    console.log(
      `✅ Successfully generated ${successful.length} clean type file(s):`,
    );
    successful.forEach((result) => {
      const methodSummary = Object.entries(result.methodCounts || {})
        .map(([method, count]) => `${method}(${count})`)
        .join(", ");
      console.log(
        `   ${result.input} → ${result.output} (${result.apiCount} endpoints: ${methodSummary})`,
      );
    });
  }

  if (failed.length > 0) {
    console.log(`❌ Failed to generate ${failed.length} file(s):`);
    failed.forEach((result) => {
      console.log(`   ${result.input}: ${result.error}`);
    });
  }

  // Exit with error code if any files failed
  if (failed.length > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error during type generation:", error.message);
  process.exit(1);
}
