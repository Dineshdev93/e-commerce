import React from "react";
import { Routes , Route, Navigate } from "react-router-dom";
import { HomePageContainer } from "@/pages/Home/index";
export const AppRoutes : React.FC = () => {
     return (
          <Routes>
              <Route path="/home/*"
                element={<HomePageContainer/>}/>
                
               <Route path="*" element={<Navigate to={"/home"} replace/>} /> 
          </Routes>
     )
}