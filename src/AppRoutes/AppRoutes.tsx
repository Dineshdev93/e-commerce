import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePageContainer } from "@/pages/Home/index";
import { Layout } from "@/layout";
export const AppRoutes: React.FC = () => {
     return (
          <Routes>
               <Route path="/home/*"
                    element={
                         <Layout>
                              <HomePageContainer />
                         </Layout>
                    } />
               <Route path="*" element={<Navigate to={"/home"} replace />} />
          </Routes>
     )
}