import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePageContainer } from "@/pages/Home/index";
import { Layout } from "@/layout";
import RegisterUser from "@/pages/user";
export const AppRoutes: React.FC = () => {
     return (
          <Routes>
               <Route path="/home/*"
                    element={
                         <Layout>
                              <HomePageContainer />
                         </Layout>
                    } />
               <Route
                    path="/userAuth/register/"
                    element={
                         <Layout>
                              <RegisterUser />
                         </Layout>
                    }
               />
               <Route path="*" element={<Navigate to={"/home"} replace />} />
          </Routes>
     )
}