// utils/ProjectContext.js
import React, { createContext, useState } from 'react';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projectData, setProjectData] = useState({
        projectId: null,
        projectName: '',
        projectNumber: '',
        owner: '',
        userId: null, 
    });

    const [weeklyReport, setWeeklyReport] = useState();
    const [InvoiceReport, setInvoiceReport] = useState();
    const [photoSelect, setPhotoSelect] = useState([])
    const [isBoss, setIsBoss] = useState(false);
    
    const [DailyEntryReport, setDailyEntryReport] = useState();
    const [WeeklyEntryReport, setWeeklyEntryReport] = useState();
    const [DairyEntryReport, setDairyEntryReport] = useState();
    const [JobHazardEntryReport, setJobHazardEntryReport] = useState()
    return (
        <ProjectContext.Provider value={{JobHazardEntryReport, setJobHazardEntryReport,DairyEntryReport, setDairyEntryReport, WeeklyEntryReport, setWeeklyEntryReport,projectData, setProjectData,weeklyReport, setWeeklyReport,InvoiceReport, setInvoiceReport,photoSelect, setPhotoSelect,isBoss, setIsBoss,DailyEntryReport, setDailyEntryReport }}>
            {children}
        </ProjectContext.Provider>
    );
};