import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import LandingPage from "./components/landing-page/LandingPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage/>}>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;