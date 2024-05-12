import React, {useEffect, useState} from 'react';
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from "./components/home/Home";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;