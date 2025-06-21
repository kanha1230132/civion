export const dailyEntryTabs = [1,2,3,4,5,6];
export const dailyEntryTitle = {
    ProjectDetails: 'Project Details',
    EquipmentDetails: 'Equipment Details',
    VisitorDetails: 'Visitor Details',
    LabourDetails: 'Labour Details',
    Description: 'Description',
    DeclarationForm :'Declaration Form'
}


export const formLists = [
    {
        title : "Progress of Work",
        list : [
            {
                key : "Has 3-week look-ahead work been field verified?",
                value : "",
                type: Boolean,
            },
            {
                key : "Are “As-Built” (redline) records up to date?",
                value : "",
                type: Boolean,
            }
        ]
    },
    {
        title : "Schedule Update",
        list : [
            {
                key : "Difficulties encountered on site which may impact schedule?",
                value : "",
                type: Boolean,
            },
            {
                key : "Work proceeding in accordance with contractor look-ahead?",
                value : "",
                type: Boolean,
            },
            {
                key : "Work generally proceeding in accordance with project baseline schedule?",
                value : "",
                type: Boolean,
            },
            {
                key : "Are all required shop drawings, RFIs, and submittals up to date?",
                value : "",
                type: Boolean,
            }
        ]
    },
    {
        title : "Environmental Incidents",
        list : [
            {
                key : "Prohibited materials, equipment, tools, etc. inside cell?",
                value : "",
                type: Boolean,
            },
            {
                key : "Any contamination, spills, or noncompliance of work (as per standards/specification/contract)?",
                value : "",
                type: Boolean,
            }
        ]

    },
    {
        title : "Property Damage to Existing Systems & Equipment",
        list : [
            {
                key : "Damage to existing systems, property, equipment, tools etc. due to work activities?",
                value : "",
                type: Boolean,
            },
            {
                key : "Prohibited use/operation of existing systems, property, equipment, tools?",
                value : "",
                type: Boolean,
            }
        ]
    },
    {
        title : "Shutdowns, Lock-Outs, Commissioning",
        list : [
            {
                key : "Are there any current ongoing lock-outs, shutdowns, or commissioning tasks?",
                value : "",
                type: Boolean,
            },
            {
                key : "Are all required locks, colour tags, equipment tags, etc. attached to equipment?",
                value : "",
                type: Boolean,
            },
            {
                key : "Are there any upcoming lock-outs, shutdowns, or commissioning tasks?",
                value : "",
                type: Boolean,
            },
            {
                key : "If Yes – Please indicate the required parties notified, dates, and required actions",
                value : "",
                type: String,
            }
        ]
    },
    {
        title : "Public Relations",
        list : [
            {
                key : "Residential complaints, concerns, or conflicts?",
                value : "",
                type: Boolean,
            },
            {
                key : "Operations or Regional complaints, concerns, or conflicts?",
                value : "",
                type: Boolean,
            },
            {
                key : "Has Contractor been abiding by contract work-restrictions (no deliveries/exterior work before 7am or after 5pm etc.)?",
                value : "",
                type: Boolean,
            }
        ]
    },
    {
        title : "Health and Safety & Covid-19",
        list : [
            {
                key : "Incidents/Infractions/Safety Meetings",
                value : "",
                type: String,
            },
            {
                key : "Covid-19 Policy and Procedures being adhered to/followed? – Daily screening",
                value : "",
                type: Boolean
            }

        ]
    },
    {
        title : "Potential Claim for Extra Work (Outside of Tender Scope)",
        list : [
            {
                key : "Description of extra works:",
                value : "",
                type: String
            },
            {
                key : "Equipment used:",
                value : "",
                type: String
            },
            {
                key : "Materials used:",
                value : "",
                type: String
            },
            {
                key : "Duration of work:",
                value : "",
                type: String
            }
        ]

    }
]
export const initializeDailyEntry = {
    userId: '',
    projectId: '',
    projectName: '',
    projectNumber: '',
    ownerProjectManager: '',
    owner: '',
    location: '',
    tempHigh: '',
    tempLow: '',
    onShore: '',
    weather: '',
    workingDay: '',
    contractNumber: '',
    contractor: '',
    siteInspector: '',
    timeIn: '',
    timeOut: '',
    ownerContact: '',
    component: '',
    selectedDate: '',
    labours : [],
    equipments : [],
    visitors : [],
    description : '',
    signature :'',
    declrationForm: formLists
}



