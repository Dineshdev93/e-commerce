import React, { useState } from 'react';
import userlogo from "@/assets/userlogo.jpg"
import {AvatarCircle, FormWrapper, Input, Label, LeftSection, ProfilePreviewWrapper, RegisterButton, RegisterContainer, RightSection, Subtitle, Title} from "@/components/user/style/userStyle"
import { InputGroup } from 'react-bootstrap';
import type{RegisterUserPayload} from "@/types/generated/user-auth-open-spec" 
import { partial } from 'io-ts';
// --- Main Component ---

const RegisterUserComponent: React.FC = () => {
    const [formData, setFormData] = useState ({
        firstname: '',
        lastname: '',
        email: '',
        userprofile: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting User Profile Data:", formData);
    };

    return (
        <RegisterContainer>
            <LeftSection>
                <FormWrapper onSubmit={handleSubmit}>
                    <Title>User Registration</Title>
                    <Subtitle>Complete the fields below to create your profile.</Subtitle>

                    {/* User Profile Preview Section */}
                    <ProfilePreviewWrapper>
                        <AvatarCircle src={userlogo} alt="Profile Preview" />
                        <Label>Profile Picture URL</Label>
                        <Input
                            style={{ width: '100%', fontSize: '0.8rem' }}
                            type="text"
                            name="userprofile"
                            value={formData.userprofile}
                            onChange={handleChange}
                            placeholder="Cloudinary image link"
                        />
                    </ProfilePreviewWrapper>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <InputGroup style={{ flex: 1 }}>
                            <Label>First Name</Label>
                            <Input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                            />
                        </InputGroup>

                        <InputGroup style={{ flex: 1 }}>
                            <Label>Last Name</Label>
                            <Input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                            />
                        </InputGroup>
                    </div>
                   <div style={{ display: 'flex', gap: '15px'  , marginTop:"10px"}}>

                    <InputGroup>
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            name="password"
                            placeholder="Create a secure password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>
                   </div>

                    <RegisterButton type="submit">Create Account</RegisterButton>
                </FormWrapper>
            </LeftSection>
            <RightSection />
        </RegisterContainer>
    );
};

export default RegisterUserComponent;