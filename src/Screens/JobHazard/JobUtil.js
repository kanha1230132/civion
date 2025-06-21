
export const JobTabs = [
    1,
    2,
    3,
    4
]

export const JobTabTitles ={
    title1: 'Enter Project Details',
    title2: 'Hazard Selection',
    title3: 'Task Addition',
    title4: 'General Details',
}

export const initialHazardCat ={
    "Worksite_Hazards": "Worksite Hazards",
    "Equipment_Hazards": "Equipment Hazards",
    "Ergonomic_Hazards": "Ergonomic Hazards",
    "Confined/Restricted_Spaces": "Confined/Restricted Spaces",
    "Environmental_Hazards": "Environmental Hazards",
    "Additional_Requirements": "Additional Requirements",
    "Misc._Hazards": "Misc. Hazards",
}



export const hazardCategories = [
    "Worksite Hazards",
    "Equipment Hazards",
    "Ergonomic Hazards",
    "Confined/Restricted Places",
    "Environmental Hazards",
    "Additional Requirements",
    "Misc. Hazards",
];
export const ergonomicHazards = [
    "Rough Terrain",
    "Traversing Steep Slopes",
    "Excessive Noise Levels",
    "Excessive Dust/Fumes",
    "Working in Darkness",
    "Lighting - Lack of",
    "Slips, Trips and Falls",
    "Awkward Body Positioning",
    "Prolonged Twisting/Bending",
    "Pinch Points",
    "Other",
];
export const equipmentHazards = [
    "Hand Tools",
    "Power Tools",
    "Field Equipment",
    "Ladders",
    "Scaffolds",
    "Aerial Work Platforms",
    "Stuck Vehicles",
    "Lockout/Tagout",
    "Other",
];
export const worksiteHazards = [
    "Heavy Construction Equipment",
    "Access / Egress at Site",
    "Open Excavations / Trenches",
    "Proper Shoring / Cut-Backs",
    "Overhead Lines",
    "Roadway Obstacles",
    "Underground Utilities",
    "U/G Locates Current and Available",
    "Potential For Electric Shock",
    "Pile Driving",
    "Floor/Dangerous Openings",
    "Hazardous Materials",
    "Pedestrians",
    "Public Traffic - High/Low Volume",
    "Traffic Control",
    "Cranes/Hoists/Lifting Devices",
    "Working at Heights",
    "Working On/Near/Over Water",
    "Working On/Near Ice",
    "Communications",
    "Housekeeping",
    "Welding",
    "Drilling",
    "Other",
];
export const confinedSpacesHazards = [
    "Access/Egress",
    "Hazardous Environment",
    "CSE Permit",
    "CSE Equipment",
    "Ventilation/Purging",
    "Enough Attendants/Monitor #",
    "Communications",
    "Atmosphere Monitoring",
    "Rescue Plan",
    "Other",
];
export const environmentalHazards = [
    "Extreme Weather",
    "Hot/Cold Working Conditions",
    "Spills/Leaks",
    "Dewatering",
    "Erosion Control/Storm Drains",
    "Other",
];
export const additionalRequirements = [
    "Sufficient Training",
    "Standard PPE in Good Condition",
    "Specialty PPE - Available",
    "Fire Extinguisher",
    "First Aid Kit",
    "First Aid Attendant/s Onsite",
    "Eye Wash Station - Available",
    "Is Your Site Orientation Done?",
    "Know Emergency Response Plan",
    "Are You Fit For Duty?",
    "Is 911 Available in Your Work Area?",
    "Other",
];
export const miscHazards = [
    "Hazardous Materials/Substances",
    "Are You Working Alone at Any Time",
    "New Workers",
    "Fatigue",
    "Lifting/Handling Loads",
    "Bridge Inspection",
    "Potential Violence/Harassment",
    "Other",
];

export const formList = [
    {
        "Worksite Hazards": worksiteHazards,
        active:true,
    },
    {
        "Equipment Hazards": equipmentHazards,
        active:false,

    },
    {
        "Ergonomic Hazards": ergonomicHazards,
        active:false,

    },
    {
        "Confined/Restricted Spaces": confinedSpacesHazards,
        active:false,

    },
    {
        "Environmental Hazards": environmentalHazards,
        active:false,
        
    },
    {
        "Additional Requirements": additionalRequirements,
        active:false,

    }, {
        "Misc. Hazards": miscHazards,
        active:false,

    }
]

export const severityOptions = [
    { label: "High (H)", value: "H" },
    { label: "Medium (M)", value: "M" },
    { label: "Low (L)", value: "L" },
];

export const hazardOptions = [
    {
        label: "Claustrophobia Due to Tight Spaces",
        value: "Claustrophobia Due to Tight Spaces",
    },
    {
        label: "Communication or Lack Thereof",
        value: "Communication or Lack Thereof",
    },
    { label: "Confined Space Entry", value: "Confined Space Entry" },
    {
        label: "Confined Space Rescue Plan",
        value: "Confined Space Rescue Plan",
    },
    { label: "Construction Equipment", value: "Construction Equipment" },
    { label: "Excessive Dust/Fumes", value: "Excessive Dust/Fumes" },
    { label: "Excessive Noise Levels", value: "Excessive Noise Levels" },
    { label: "Floor/Dangerous Openings", value: "Floor/Dangerous Openings" },
    { label: "Grinding and Cutting", value: "Grinding and Cutting" },
    {
        label: "Hazardous Materials/Substances",
        value: "Hazardous Materials/Substances",
    },
    { label: "Inadequate/Defective PPEs", value: "Inadequate/Defective PPEs" },
    { label: "Insect Bites and Stings", value: "Insect Bites and Stings" },
    { label: "Mobile/Tower/Bridge Crane", value: "Mobile/Tower/Bridge Crane" },
    { label: "Needles/Sharp Objects", value: "Needles/Sharp Objects" },
    { label: "Open Excavation/Trenches", value: "Open Excavation/Trenches" },
    {
        label: "Potential for Electric Shock",
        value: "Potential for Electric Shock",
    },
    {
        label: "Presence of Hazardous Gases",
        value: "Presence of Hazardous Gases",
    },
    { label: "Scaffold Stairs/Ladders", value: "Scaffold Stairs/Ladders" },
    { label: "Slips/Trips/Falls", value: "Slips/Trips/Falls" },
    { label: "Traversing Steep Slopes", value: "Traversing Steep Slopes" },
    { label: "Welding", value: "Welding" },
    { label: "Working Alone", value: "Working Alone" },
    { label: "Working at Heights", value: "Working at Heights" },
    { label: "Working in Cold Weather", value: "Working in Cold Weather" },
    {
        label: "Working in Darkness/Low Light Conditions",
        value: "Working in Darkness/Low Light Conditions",
    },
    { label: "Working in Hot Weather", value: "Working in Hot Weather" },
    {
        label: "Working on/near/over water",
        value: "Working on/near/over water",
    },
];

export const controlPlans = {
    "Claustrophobia Due to Tight Spaces":"Ensure that entrants are fit to enter the confined space. Ensure that all PPE is being worn and if at all the entrant feels uncomfortable at anytime, they should remove themselves from the confined space entry work",
    "Construction Equipment":
        "Wear appropriate PPE and ensure if possible, to make eye contact with equipment operator so that they are aware you are in the area",
    "Excessive Dust/Fumes":
        "In areas that dust/fumes cannot be controlled or vented, don respiratory protective equipment or avoid the area until dust/fumes can be reduced or eliminated.",
    "Excessive Noise Levels":
        "Ensure that you are wearing proper hearing protection in any areas where the decibel levels exceed 85 dBA and are unable to be controlled. Wear double hearing protection where required or instructed to do so.",
    "Floor/Dangerous Openings":
        "Ensure that proper controls are in place to protect the worker from any openings that are on the site. Ensure that proper PPE is worn and inspected if work is taking place around the opening. Do not lean, sit or stand onto a floor covering without first knowing if it can support your weight.",
    "Open Excavation/Trenches": "Do not stand/walk along edge of excavation",
    "Communication or Lack Thereof":
        "Ensure that a proper line of communication between the entrant and attendant has been established prior to confined space entry",
    "Confined Space Entry":
        "Ensure the confined space area that is being entered has been tested for atmospheric conditions prior to entry and work. Ensure all PPE has been inspected and is in full working order. Ensure that a Confined Space Entry Permit has been completed, fully understood, and signed prior to performing this task.",
    "Confined Space Rescue Plan":
        "Ensure that a proper confined space entry plan has been developed and discussed with all workers present who will be undertaking confined space entry/work. Do not attempt rescue if you are not trained to do so.",
    "Grinding and Cutting":
        "Ensure all proper PPE is being worn when completing this task. Ensure area is ventilated to remove any dust or fumes that arise from this task. Check all equipment to ensure it is in working order and all safety guards and precautions are taking when performing this task.",
    "Hazardous Materials/Substances":
        "Read MSDS prior to use of material. Wear appropriate PPE and follow guidelines with regards to MSDS.",
    "Inadequate/Defective PPEs":
        "Ensure that the correct PPE is being worn and that all PPE has been well inspected prior to confined space entry. Ensure that defective items of PPE are taken out of service.",
    "Insect Bites and Stings":
        "Use deet and/or try to avoid areas dense with ticks, mosquitoes, spiders, or any other insects that could potentially carry a virus or disease. If issues with insects persists. Consider fumigation. ",
    "Mobile/Tower/Bridge Crane":
        "Always know where the load is and never walk or stand under the load.",
    "Needles/Sharp Objects":
        "Identify areas that could potentially have sharp objects – have a “sharps” bin on site and remove the hazard following correct procedures and safety protocols. If pricked by an unknown needle or sharp object. Consult your doctor immediately.",
    "Potential for Electric Shock":
        "Stand clear of energized equipment when it is being worked on. Wear specialized PPE when required.",
    "Presence of Hazardous Gases":
        "Ensure that a CSA approved 4 head gas detection monitor is being used to test levels prior to entry as well as worn on the person/s who will be working in the confined space.",
    "Scaffold Stairs/Ladders":
        "Maintain 3 point contact and visually check for any danger or caution flag/tape that may be attached.",
    "Slips/Trips/Falls":
        "Watch footing and clear pathways of hazards and debris.",
    "Traversing Steep Slopes":
        "Ensure that you use any handrails or walkways intended for use to traverse steep slope. If those are not available, watch your footing and traverse with your body parallel to the slope. Ensure proper footwear is being worn.",
    "Welding":
        "Position yourself while welding or cutting is taking place so that your head is not in the fumes. Avoid looking or staring directly at welding flash and wear appropriate PPE. ",
    "Working Alone":
        "Sign in & out, and follow any specific protocols or procedures that are required on your site.",
    "Working at Heights":
        "If above 3m, make sure you have the appropriate training and are wearing the appropriate PPE for the job.",
    "Working in Cold Weather":
        "Layer up and take warm up breaks when necessary.",
    "Working in Darkness/Low Light Conditions":
        "Place temporary lighting if possible, if not, then ensure you have a well maintained and charged headlamp/flashlight. Ensure equipment is intrinsically safe if being used for confined space work.",
    "Working in Hot Weather":
        "Stay hydrated and take cool down breaks when necessary.",
    "Working on/near/over water":
        "Wear specialized PPE when required. Watch for tripping hazards when walking over or near water. Have proper rescue plan in place in the event of falling in.",
};


export const initializeJobHarzard = {
    dateReviewed:'',
    siteOrientationChecked: false,
    toolBoxMeetingChecked: false,
    tasks: [],
    checkedItems: [],
    otherText: '',
    selectedDate: '',
    time: '',
    location: '',
    projectName: '',
    description: '',
    
}