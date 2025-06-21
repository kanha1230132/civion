import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { initializeJobHarzard } from './JobUtil';

const useJobHazardHook = () => {
    const [jobHazardEntry, setJobHazardEntry] = useState({...initializeJobHarzard});

    return {
        jobHazardEntry, setJobHazardEntry,
        
    }
}

export default useJobHazardHook
