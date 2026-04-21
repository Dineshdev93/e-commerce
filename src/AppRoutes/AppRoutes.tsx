import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePageContainer } from "@/pages/Home/index";
import { Layout } from "@/layout";
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import { TermsAndConditions } from "@/pages/TermsAndConditions";
export const AppRoutes: React.FC = () => {
     return (
          <Routes>
               <Route path="/home/*"
                    element={
                         <Layout>
                              <HomePageContainer />
                         </Layout>
                    } />

               <Route path="/privacy" element={
                    <Layout
                    >

                         <PrivacyPolicy />
                    </Layout>

               } />
               <Route path="/terms" element=
                    {
                         <label>
                              <TermsAndConditions />
                         </label>
                    } />
               <Route path="*" element={<Navigate to={"/home"} replace />} />
          </Routes>
     )
}