import type React from "react";
import { NavBar } from "@/layout/sections/NavBar";
import { Footer } from "@/layout/sections/Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <NavBar />
               {children}
            <Footer />
        </>
    )
}