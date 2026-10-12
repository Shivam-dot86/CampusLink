import {
  StudentProfile,
  RecruiterDrive,
  DriveScheduleSlot,
  ScheduleConflict,
  OfferRecord,
  BroadcastNotification,
  PlacementStats,
  PlacementPreTalk,
  StudentApplication,
  PeerInterviewInsight,
  CompanyMoU,
  CoordinatorVolunteerTask,
  GroundIssueTicket,
  AuditLogEntry,
  DriveApprovalRequest
} from '../types';

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'std-101',
    usn: '1RM21CS042',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campuslink.edu',
    phone: '+91 98451 22341',
    branch: 'CSE',
    batch: '2026 Batch',
    cgpa: 8.92,
    tenthPercentage: 94.5,
    twelfthPercentage: 91.2,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    readinessScore: 92,
    tier: 'Corporate Ready',
    skills: [
      { name: 'Data Structures & Algorithms', category: 'Technical', level: 5 },
      { name: 'Python & FastAPI', category: 'Technical', level: 5 },
      { name: 'React.js & TypeScript', category: 'Frameworks', level: 4 },
      { name: 'PostgreSQL & Redis', category: 'Tools', level: 4 },
      { name: 'System Design Basics', category: 'Core CS', level: 4 },
      { name: 'Corporate Communication', category: 'Soft Skills', level: 5 }
    ],
    certifications: ['AWS Certified Solutions Architect Associate', 'Rooman Cloud Practitioner', 'HackerRank 6-Star Python'],
    projectsCount: 4,
    topProjects: [
      {
        title: 'Distributed File Sync Engine',
        tech: ['Go', 'Raft', 'gRPC'],
        description: 'Fault-tolerant distributed log replication with leader election and local disk persistence.'
      },
      {
        title: 'CAMPUSLINK Resume Parser',
        tech: ['Python', 'spaCy', 'FastAPI'],
        description: 'NLP pipeline extracting candidate entity profiles from PDF/DOCX resumes with 94% accuracy.'
      }
    ],
    projects: [
      {
        id: 'prj-101-1',
        title: 'Distributed File Sync Engine',
        domain: 'Systems & Cloud',
        tech: ['Go', 'Raft', 'gRPC', 'Protobuf'],
        description: 'Fault-tolerant distributed log replication with leader election, heartbeat health-checks, and persistent disk state machine.',
        githubUrl: 'https://github.com/aaravsharma/dist-raft-sync',
        demoUrl: 'https://raft-sync-demo.vercel.app',
        impact: 'Maintained 99.9% consistency across 5 nodes with sub-15ms quorum commit latency under simulated packet drop.'
      },
      {
        id: 'prj-101-2',
        title: 'CAMPUSLINK Automated Resume Parser',
        domain: 'AI & Data Processing',
        tech: ['Python', 'spaCy', 'FastAPI', 'PostgreSQL'],
        description: 'Custom Named Entity Recognition (NER) pipeline parsing diverse multi-column resume formats into normalized candidate skill graphs.',
        githubUrl: 'https://github.com/aaravsharma/campuslink-resume-nlp',
        demoUrl: 'https://resume-nlp.rooman.net',
        impact: 'Processed 1,200+ batch resumes with 94.2% F1 score in skill entity recognition.'
      }
    ],
    internships: [
      {
        id: 'int-101-1',
        company: 'Rooman Technologies',
        role: 'Cloud Engineering Intern',
        duration: 'Jun 2025 - Aug 2025 (3 Months)',
        stipend: '₹25,000/month',
        description: 'Automated CI/CD provisioning pipelines on AWS using Terraform & GitHub Actions, lowering environment build times by 40%.',
        skillsUsed: ['AWS Lambda', 'Terraform', 'Docker', 'Python', 'GitHub Actions'],
        certificateUrl: 'https://credentials.rooman.net/verify/INT-2025-089',
        verified: true
      },
      {
        id: 'int-101-2',
        company: 'InnoByte Systems',
        role: 'Backend Developer Trainee',
        duration: 'Jan 2025 - Mar 2025 (2 Months)',
        stipend: '₹15,000/month',
        description: 'Built high-throughput payment webhook handlers and caching tiers in FastAPI & Redis for e-commerce clients.',
        skillsUsed: ['FastAPI', 'Redis', 'PostgreSQL', 'PyTest'],
        certificateUrl: 'https://verify.innobyte.io/cert/IB-7721',
        verified: true
      }
    ],
    programs: [
      {
        id: 'prg-101-1',
        title: 'Rooman Advanced Cloud & DevOps Immersion',
        provider: 'Rooman Technologies',
        category: 'Cloud',
        completionDate: 'May 2025',
        credentialId: 'RMN-CLD-9941',
        scoreOrGrade: 'Grade A+ (94%)',
        verified: true
      },
      {
        id: 'prg-101-2',
        title: 'AWS Academy Cloud Solutions Foundations',
        provider: 'AWS Academy',
        category: 'Cloud',
        completionDate: 'Feb 2025',
        credentialId: 'AWS-ACAD-3381',
        scoreOrGrade: 'Pass with Distinction',
        verified: true
      }
    ],
    resume: {
      atsScore: 92,
      lastUpdated: '2026-09-15',
      fileName: 'Aarav_Sharma_SDE_Resume_v4.pdf',
      summary: 'B.E. Computer Science senior with 480+ LeetCode problems, hands-on experience in distributed Go systems and AWS cloud automation.',
      keyKeywordsMatched: ['Distributed Systems', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'RESTful API', 'Algorithms'],
      missingKeywords: ['Kubernetes Cluster Admin', 'CI/CD Pipeline Security'],
      improvements: [
        'Add quantitative latency benchmark to the distributed file sync project description.',
        'Highlight experience leading college Open Source Club.'
      ]
    },
    apaarRecord: {
      apaarId: '9842-1049-3821',
      abcId: 'ABC-849-204-192',
      digiLockerVerified: true,
      totalCreditsEarned: 146,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 8.80, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 8.95, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 8.85, creditsEarned: 25, backlogs: 0, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 9.10, creditsEarned: 25, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 8.90, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 9.00, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-CS-042',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Computer Science & Engineering',
      lastSyncDate: '2026-09-18'
    },
    prePlacementTalksAttended: ['ppt-rooman-01', 'ppt-google-02', 'ppt-cisco-03'],
    leetcodeSolved: 480,
    githubRepos: 24,
    mockInterviewScore: 94,
    aptitudeScore: 91,
    attendancePercent: 96,
    isAtRisk: false,
    placementStatus: 'Offered',
    offersCount: 2,
    highestPackageLPA: 16.5
  },
  {
    id: 'std-102',
    usn: '1RM21IS019',
    name: 'Priyanka Sen',
    email: 'priyanka.sen@campuslink.edu',
    phone: '+91 98862 77123',
    branch: 'IT',
    batch: '2026 Batch',
    cgpa: 9.15,
    tenthPercentage: 96.0,
    twelfthPercentage: 93.4,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    readinessScore: 95,
    tier: 'Corporate Ready',
    skills: [
      { name: 'Machine Learning & PyTorch', category: 'Technical', level: 5 },
      { name: 'Java & Spring Boot', category: 'Frameworks', level: 5 },
      { name: 'Data Structures & Algorithms', category: 'Technical', level: 5 },
      { name: 'Docker & Kubernetes', category: 'Cloud & DevOps', level: 4 },
      { name: 'Executive Presentation', category: 'Soft Skills', level: 5 }
    ],
    certifications: ['TensorFlow Developer Certificate', 'Rooman AI & ML Specialist', 'Oracle Certified Java SE 11'],
    projectsCount: 5,
    topProjects: [
      {
        title: 'Deep Vision Defect Inspector',
        tech: ['PyTorch', 'YOLOv8', 'Flask'],
        description: 'Automated defect detection pipeline for semiconductor wafer testing.'
      }
    ],
    projects: [
      {
        id: 'prj-102-1',
        title: 'Deep Vision Defect Inspector',
        domain: 'Computer Vision & Manufacturing AI',
        tech: ['PyTorch', 'YOLOv8', 'FastAPI', 'Docker', 'CUDA'],
        description: 'End-to-end edge AI vision system inspecting silicon wafer micro-cracks in real time with high accuracy.',
        githubUrl: 'https://github.com/priyankasen/wafer-defect-vision',
        demoUrl: 'https://wafer-vision-ai.app',
        impact: 'Achieved 97.8% mAP score with 42 FPS inference on Nvidia Jetson Orin.'
      },
      {
        id: 'prj-102-2',
        title: 'Enterprise Microservice Core',
        domain: 'Backend Engineering',
        tech: ['Java 17', 'Spring Boot 3', 'Kafka', 'PostgreSQL'],
        description: 'Event-driven order and inventory microservice cluster handling 10,000 req/sec with transactional outbox pattern.',
        githubUrl: 'https://github.com/priyankasen/spring-cloud-core',
        impact: 'Decreased message latency from 180ms to 24ms via distributed Kafka partitions.'
      }
    ],
    internships: [
      {
        id: 'int-102-1',
        company: 'Google Cloud India',
        role: 'Cloud AI Research Intern',
        duration: 'May 2025 - Jul 2025 (2.5 Months)',
        stipend: '₹85,000/month',
        description: 'Developed automated model quantization and Vertex AI pipeline integrations for enterprise clients.',
        skillsUsed: ['Vertex AI', 'Python', 'TensorFlow', 'Kubernetes'],
        certificateUrl: 'https://credentials.google.com/verify/GCP-AI-INT-2025-01',
        verified: true
      }
    ],
    programs: [
      {
        id: 'prg-102-1',
        title: 'Rooman AI & Deep Learning Masterclass',
        provider: 'Rooman Technologies',
        category: 'AI & Data',
        completionDate: 'Apr 2025',
        credentialId: 'RMN-AI-7789',
        scoreOrGrade: 'Honors / Top 1%',
        verified: true
      }
    ],
    resume: {
      atsScore: 96,
      lastUpdated: '2026-09-12',
      fileName: 'Priyanka_Sen_ML_Cloud_Resume.pdf',
      summary: 'Senior IT student and Google Cloud intern with 9.15 CGPA, specialized in deep learning vision systems and production microservices.',
      keyKeywordsMatched: ['PyTorch', 'Spring Boot', 'Kafka', 'Vertex AI', 'Kubernetes', 'Computer Vision', 'Microservices'],
      missingKeywords: ['Helm Charts'],
      improvements: ['Resume is already in top 2% of campus submissions. Verified across all ATS criteria.']
    },
    apaarRecord: {
      apaarId: '8712-4491-0021',
      abcId: 'ABC-102-998-331',
      digiLockerVerified: true,
      totalCreditsEarned: 152,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 9.10, creditsEarned: 25, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 9.20, creditsEarned: 25, backlogs: 0, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 9.15, creditsEarned: 26, backlogs: 0, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 9.05, creditsEarned: 26, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 9.25, creditsEarned: 25, backlogs: 0, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 9.15, creditsEarned: 25, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-IT-019',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Information Technology',
      lastSyncDate: '2026-09-18'
    },
    prePlacementTalksAttended: ['ppt-google-02', 'ppt-rooman-01', 'ppt-cisco-03', 'ppt-deloitte-04'],
    leetcodeSolved: 410,
    githubRepos: 32,
    mockInterviewScore: 96,
    aptitudeScore: 95,
    attendancePercent: 98,
    isAtRisk: false,
    placementStatus: 'Joined',
    offersCount: 3,
    highestPackageLPA: 22.0
  },
  {
    id: 'std-103',
    usn: '1RM21AI008',
    name: 'Rohan Kulkarni',
    email: 'rohan.k@campuslink.edu',
    phone: '+91 99014 55621',
    branch: 'AI&DS',
    batch: '2026 Batch',
    cgpa: 8.41,
    tenthPercentage: 88.0,
    twelfthPercentage: 85.5,
    activeBacklogs: 0,
    historyOfBacklogs: 1,
    readinessScore: 84,
    tier: 'Corporate Ready',
    skills: [
      { name: 'SQL & Data Warehousing', category: 'Technical', level: 5 },
      { name: 'Python & Pandas', category: 'Technical', level: 4 },
      { name: 'Tableau & Power BI', category: 'Tools', level: 4 },
      { name: 'React Frontend', category: 'Frameworks', level: 3 },
      { name: 'Client Pitching', category: 'Soft Skills', level: 4 }
    ],
    certifications: ['Snowflake SnowPro Core', 'Microsoft Power BI Analyst', 'Rooman Data Engineering'],
    projectsCount: 3,
    topProjects: [
      {
        title: 'E-commerce Churn Predictor',
        tech: ['XGBoost', 'Streamlit', 'Snowflake'],
        description: 'Customer retention churn modeling yielding 86% F1 score.'
      }
    ],
    projects: [
      {
        id: 'prj-103-1',
        title: 'E-commerce Churn Predictor & Retention Dashboard',
        domain: 'Data Analytics & ML',
        tech: ['Snowflake', 'Python', 'XGBoost', 'Streamlit'],
        description: 'Enterprise data pipeline aggregating 500k customer transactions to predict customer churn probability with SHAP explainability.',
        githubUrl: 'https://github.com/rohankulkarni/churn-analytics-pipeline',
        demoUrl: 'https://churn-analytics.streamlit.app',
        impact: 'Delivered 86.4% F1 score and provided actionable retention cohorts for marketing teams.'
      }
    ],
    internships: [
      {
        id: 'int-103-1',
        company: 'Apex Data Insights',
        role: 'Data Analyst Intern',
        duration: 'Jun 2025 - Aug 2025',
        stipend: '₹20,000/month',
        description: 'Designed Snowflake data marts and interactive Power BI executive dashboards for retail clients.',
        skillsUsed: ['Snowflake', 'SQL', 'Power BI', 'Python'],
        certificateUrl: 'https://apexdata.io/verify/INT-AI-902',
        verified: true
      }
    ],
    programs: [
      {
        id: 'prg-103-1',
        title: 'Rooman Big Data & Snowflake Engineering',
        provider: 'Rooman Technologies',
        category: 'AI & Data',
        completionDate: 'May 2025',
        credentialId: 'RMN-DS-5512',
        scoreOrGrade: 'Grade A (89%)',
        verified: true
      }
    ],
    resume: {
      atsScore: 86,
      lastUpdated: '2026-09-14',
      fileName: 'Rohan_Kulkarni_Data_Analyst.pdf',
      summary: 'Data & AI engineering graduate adept in Snowflake warehouses, SQL query optimization, and predictive modeling with Python.',
      keyKeywordsMatched: ['Snowflake', 'SQL', 'Python', 'XGBoost', 'Power BI', 'Data Warehousing'],
      missingKeywords: ['Apache Spark', 'dbt Data Modeling'],
      improvements: ['Add portfolio link to Tableau Public dashboards.']
    },
    apaarRecord: {
      apaarId: '9102-3819-7712',
      abcId: 'ABC-551-902-884',
      digiLockerVerified: true,
      totalCreditsEarned: 140,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 8.30, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 8.25, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 8.10, creditsEarned: 23, backlogs: 1, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 8.60, creditsEarned: 25, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 8.55, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 8.65, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-AI-008',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Artificial Intelligence & Data Science',
      lastSyncDate: '2026-09-18'
    },
    prePlacementTalksAttended: ['ppt-rooman-01', 'ppt-deloitte-04'],
    leetcodeSolved: 230,
    githubRepos: 18,
    mockInterviewScore: 82,
    aptitudeScore: 88,
    attendancePercent: 92,
    isAtRisk: false,
    placementStatus: 'Interviewing',
    offersCount: 1,
    highestPackageLPA: 9.5
  },
  {
    id: 'std-104',
    usn: '1RM21EC055',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@campuslink.edu',
    phone: '+91 97412 88901',
    branch: 'ECE',
    batch: '2026 Batch',
    cgpa: 7.95,
    tenthPercentage: 89.2,
    twelfthPercentage: 86.0,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    readinessScore: 78,
    tier: 'Near Ready',
    skills: [
      { name: 'Embedded C / C++', category: 'Technical', level: 4 },
      { name: 'ARM Cortex & IoT', category: 'Technical', level: 4 },
      { name: 'Python Scripting', category: 'Technical', level: 3 },
      { name: 'Git & Linux Shell', category: 'Tools', level: 3 },
      { name: 'Technical Presentation', category: 'Soft Skills', level: 4 }
    ],
    certifications: ['Rooman IoT & Edge Computing Associate', 'ARM Microcontroller Certificate'],
    projectsCount: 3,
    topProjects: [
      {
        title: 'Smart Agri-Telemetry Gateway',
        tech: ['ESP32', 'MQTT', 'FreeRTOS'],
        description: 'Sub-gigahertz remote sensor mesh for micro-climate telemetry.'
      }
    ],
    projects: [
      {
        id: 'prj-104-1',
        title: 'Smart Agri-Telemetry Mesh Gateway',
        domain: 'Embedded Systems & IoT',
        tech: ['FreeRTOS', 'ESP32', 'MQTT', 'C++', 'AWS IoT Core'],
        description: 'Low-power telemetry node gathering soil moisture and weather metrics transmitting via LoRaWAN to cloud backend.',
        githubUrl: 'https://github.com/ananyad/lora-agri-gateway',
        impact: 'Achieved 4-mile transmission range with 8 months battery life on 2x AA cells.'
      }
    ],
    internships: [
      {
        id: 'int-104-1',
        company: 'Vanguard Embedded Solutions',
        role: 'Hardware Firmware Intern',
        duration: 'Jul 2025 - Aug 2025',
        stipend: '₹18,000/month',
        description: 'Wrote board support package drivers for UART and I2C peripherals on STM32 boards.',
        skillsUsed: ['Embedded C', 'STM32', 'I2C', 'Logic Analyzers'],
        certificateUrl: 'https://vanguardembedded.com/verify/VE-8841',
        verified: true
      }
    ],
    programs: [
      {
        id: 'prg-104-1',
        title: 'Rooman Embedded Systems & IoT Mastery',
        provider: 'Rooman Technologies',
        category: 'Core CS',
        completionDate: 'May 2025',
        credentialId: 'RMN-IOT-3312',
        scoreOrGrade: 'Grade A (88%)',
        verified: true
      }
    ],
    resume: {
      atsScore: 79,
      lastUpdated: '2026-09-10',
      fileName: 'Ananya_Deshmukh_ECE_Resume.pdf',
      summary: 'Electronics engineer with strong command of FreeRTOS, Embedded C, and wireless sensor telemetry systems.',
      keyKeywordsMatched: ['Embedded C', 'FreeRTOS', 'MQTT', 'ARM Cortex', 'Linux', 'Microcontrollers'],
      missingKeywords: ['TCP/IP Stack', 'Wireshark Protocol Analysis'],
      improvements: ['Add networking protocols experience for Cisco Systems drive alignment.']
    },
    apaarRecord: {
      apaarId: '8831-5520-1928',
      abcId: 'ABC-771-440-201',
      digiLockerVerified: true,
      totalCreditsEarned: 138,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 7.80, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 7.90, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 8.00, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 8.10, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 7.95, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 8.05, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-EC-055',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Electronics & Communication',
      lastSyncDate: '2026-09-18'
    },
    prePlacementTalksAttended: ['ppt-cisco-03', 'ppt-rooman-01'],
    leetcodeSolved: 140,
    githubRepos: 12,
    mockInterviewScore: 76,
    aptitudeScore: 80,
    attendancePercent: 88,
    isAtRisk: false,
    placementStatus: 'Shortlisted',
    offersCount: 0
  },
  {
    id: 'std-105',
    usn: '1RM21CS112',
    name: 'Vikramaditya Nair',
    email: 'vikram.nair@campuslink.edu',
    phone: '+91 96112 34509',
    branch: 'CSE',
    batch: '2026 Batch',
    cgpa: 6.42,
    tenthPercentage: 74.0,
    twelfthPercentage: 71.5,
    activeBacklogs: 2,
    historyOfBacklogs: 3,
    readinessScore: 48,
    tier: 'At Risk',
    skills: [
      { name: 'C++ Basics', category: 'Technical', level: 2 },
      { name: 'HTML/CSS/Basic JS', category: 'Frameworks', level: 2 },
      { name: 'SQL Fundamentals', category: 'Technical', level: 2 },
      { name: 'Verbal Aptitude', category: 'Soft Skills', level: 3 }
    ],
    certifications: ['NPTEL C Programming'],
    projectsCount: 1,
    topProjects: [
      {
        title: 'College Bookstore Management',
        tech: ['C++', 'File Handling'],
        description: 'Console based book inventory and billing system.'
      }
    ],
    projects: [
      {
        id: 'prj-105-1',
        title: 'College Bookstore Management System',
        domain: 'Desktop & File I/O',
        tech: ['C++', 'File Handling', 'CLI'],
        description: 'Console application for searching textbook availability and printing student issue invoices.',
        impact: 'Tested locally for small inventory with basic CRUD operations.'
      }
    ],
    internships: [],
    programs: [
      {
        id: 'prg-105-1',
        title: 'NPTEL Introduction to C Programming',
        provider: 'NPTEL',
        category: 'Core CS',
        completionDate: 'Nov 2023',
        credentialId: 'NPTEL-CS-8812',
        scoreOrGrade: 'Elite Certification',
        verified: true
      }
    ],
    resume: {
      atsScore: 52,
      lastUpdated: '2026-08-20',
      fileName: 'Vikram_Nair_Resume.pdf',
      summary: 'Computer science student seeking entry level software development opportunities.',
      keyKeywordsMatched: ['C++', 'SQL', 'HTML'],
      missingKeywords: ['Data Structures', 'Git', 'REST API', 'Cloud', 'Algorithms', 'Docker'],
      improvements: [
        'Resume lacks GitHub links, projects have minimal technological complexity.',
        'No internship or live deployment recorded.',
        'Urgent: Attend Rooman Placement Remedial Clinic to build full-stack project.'
      ]
    },
    apaarRecord: {
      apaarId: '7741-9012-3841',
      abcId: 'ABC-441-290-781',
      digiLockerVerified: true,
      totalCreditsEarned: 114,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Pending Verification',
      semesterRecords: [
        { semester: 1, sgpa: 6.80, creditsEarned: 22, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 6.50, creditsEarned: 20, backlogs: 1, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 6.20, creditsEarned: 18, backlogs: 2, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 6.30, creditsEarned: 20, backlogs: 1, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 6.40, creditsEarned: 20, backlogs: 1, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 6.30, creditsEarned: 18, backlogs: 2, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-CS-112',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Computer Science & Engineering',
      lastSyncDate: '2026-09-17'
    },
    prePlacementTalksAttended: [],
    leetcodeSolved: 45,
    githubRepos: 4,
    mockInterviewScore: 45,
    aptitudeScore: 52,
    attendancePercent: 54,
    isAtRisk: true,
    riskReasons: [
      '2 Active Backlogs in Engineering Mathematics & Operating Systems',
      'Placement training attendance below mandatory 75% threshold (54%)',
      'Mock coding assessment score < 50%',
      'Ineligible for 70% of Tier-1/Tier-2 company drives due to CGPA < 7.0'
    ],
    placementStatus: 'Unplaced',
    offersCount: 0
  },
  {
    id: 'std-106',
    usn: '1RM21EE028',
    name: 'Kavya Raghavan',
    email: 'kavya.r@campuslink.edu',
    phone: '+91 94481 00234',
    branch: 'EEE',
    batch: '2026 Batch',
    cgpa: 8.12,
    tenthPercentage: 91.0,
    twelfthPercentage: 88.0,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    readinessScore: 81,
    tier: 'Corporate Ready',
    skills: [
      { name: 'Power Electronics & MATLAB', category: 'Technical', level: 4 },
      { name: 'Python for Engineers', category: 'Technical', level: 4 },
      { name: 'PLC & SCADA Basics', category: 'Tools', level: 3 },
      { name: 'Analytical Reasoning', category: 'Soft Skills', level: 4 }
    ],
    certifications: ['Rooman EV & BMS Systems Specialist', 'MATLAB Certified Associate'],
    projectsCount: 2,
    topProjects: [
      {
        title: 'EV Battery Management Algorithm',
        tech: ['Simulink', 'Stateflow', 'C'],
        description: 'SoC estimation algorithm using Extended Kalman Filtering.'
      }
    ],
    projects: [
      {
        id: 'prj-106-1',
        title: 'EV Battery Management System (BMS) Firmware',
        domain: 'CleanTech & Energy Systems',
        tech: ['MATLAB', 'Simulink', 'Embedded C', 'CAN Protocol'],
        description: 'Real-time State of Charge (SoC) and cell-balancing algorithm running on automotive CAN-bus controller.',
        impact: 'Achieved +/- 2.5% SoC accuracy across extreme thermal ranges (-10C to +50C).'
      }
    ],
    internships: [
      {
        id: 'int-106-1',
        company: 'EcoVolt Power Labs',
        role: 'EV Powertrain Trainee',
        duration: 'Jun 2025 - Aug 2025',
        stipend: '₹22,000/month',
        description: 'Modeled battery thermal degradation cycles and executed automated CAN bus hardware-in-the-loop tests.',
        skillsUsed: ['MATLAB', 'CANalyzer', 'C', 'Simulink'],
        certificateUrl: 'https://ecovolt.in/verify/EV-8821',
        verified: true
      }
    ],
    programs: [
      {
        id: 'prg-106-1',
        title: 'Rooman Electric Vehicle & Smart Grid Specialist',
        provider: 'Rooman Technologies',
        category: 'Core CS',
        completionDate: 'May 2025',
        credentialId: 'RMN-EV-4410',
        scoreOrGrade: 'Grade A+ (92%)',
        verified: true
      }
    ],
    resume: {
      atsScore: 84,
      lastUpdated: '2026-09-08',
      fileName: 'Kavya_Raghavan_EEE_BMS.pdf',
      summary: 'Electrical engineer specialized in Electric Vehicle BMS algorithms, CAN networks, and MATLAB/Simulink simulations.',
      keyKeywordsMatched: ['MATLAB', 'Simulink', 'CAN Protocol', 'Embedded C', 'Battery Management'],
      missingKeywords: ['Python Automation', 'Hardware-in-the-Loop'],
      improvements: ['Highlight analytical problem-solving and software testing fundamentals.']
    },
    apaarRecord: {
      apaarId: '9021-3341-9982',
      abcId: 'ABC-661-882-901',
      digiLockerVerified: true,
      totalCreditsEarned: 142,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 8.00, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 8.10, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 8.15, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 8.20, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 8.10, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 8.25, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-EE-028',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Electrical & Electronics',
      lastSyncDate: '2026-09-18'
    },
    prePlacementTalksAttended: ['ppt-rooman-01', 'ppt-deloitte-04'],
    leetcodeSolved: 110,
    githubRepos: 9,
    mockInterviewScore: 80,
    aptitudeScore: 86,
    attendancePercent: 94,
    isAtRisk: false,
    placementStatus: 'Offered',
    offersCount: 1,
    highestPackageLPA: 7.8
  },
  {
    id: 'std-107',
    usn: '1RM21ME040',
    name: 'Mohit Verma',
    email: 'mohit.verma@campuslink.edu',
    phone: '+91 99160 44299',
    branch: 'Mechanical',
    batch: '2026 Batch',
    cgpa: 6.85,
    tenthPercentage: 79.5,
    twelfthPercentage: 76.0,
    activeBacklogs: 1,
    historyOfBacklogs: 2,
    readinessScore: 56,
    tier: 'Needs Training',
    skills: [
      { name: 'AutoCAD & SolidWorks', category: 'Tools', level: 4 },
      { name: 'ANSYS FEA', category: 'Tools', level: 3 },
      { name: 'Basic Python', category: 'Technical', level: 2 },
      { name: 'English Fluency', category: 'Soft Skills', level: 3 }
    ],
    certifications: ['SolidWorks CSWA Certified'],
    projectsCount: 2,
    topProjects: [
      {
        title: 'Drone Chassis Stress Optimization',
        tech: ['SolidWorks', 'ANSYS'],
        description: 'Topology optimization reducing carbon composite weight by 22%.'
      }
    ],
    projects: [
      {
        id: 'prj-107-1',
        title: 'Drone Chassis Stress Optimization',
        domain: 'Mechanical Design & Simulation',
        tech: ['SolidWorks', 'ANSYS Mechanical', 'Topology Optimization'],
        description: 'Structural FEA analysis under landing impact conditions, saving 22% weight while preserving factor of safety 1.8.',
        impact: 'Validated with physical 3D printed nylon prototype test.'
      }
    ],
    internships: [],
    programs: [
      {
        id: 'prg-107-1',
        title: 'SolidWorks Mechanical Design Certification',
        provider: 'Dassault Systemes / Rooman Center',
        category: 'Core CS',
        completionDate: 'Mar 2025',
        credentialId: 'CSWA-MECH-901',
        scoreOrGrade: 'Pass',
        verified: true
      }
    ],
    resume: {
      atsScore: 61,
      lastUpdated: '2026-08-15',
      fileName: 'Mohit_Verma_Mechanical_Design.pdf',
      summary: 'Mechanical engineering student certified in SolidWorks and ANSYS structural simulation.',
      keyKeywordsMatched: ['SolidWorks', 'ANSYS', 'AutoCAD'],
      missingKeywords: ['Python', 'SQL', 'Project Management', 'Data Analysis'],
      improvements: [
        'Add technical software skills to increase eligibility for techno-commercial and tech consulting roles.',
        'Enroll in Rooman IT Bridge Clinic to learn SQL and Python for engineering analytics.'
      ]
    },
    apaarRecord: {
      apaarId: '8910-2245-8819',
      abcId: 'ABC-339-110-482',
      digiLockerVerified: true,
      totalCreditsEarned: 124,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 7.10, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 6.90, creditsEarned: 22, backlogs: 1, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 6.70, creditsEarned: 20, backlogs: 1, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 6.80, creditsEarned: 22, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 6.75, creditsEarned: 20, backlogs: 1, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 6.90, creditsEarned: 22, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-ME-040',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Mechanical Engineering',
      lastSyncDate: '2026-09-17'
    },
    prePlacementTalksAttended: ['ppt-rooman-01'],
    leetcodeSolved: 20,
    githubRepos: 2,
    mockInterviewScore: 58,
    aptitudeScore: 61,
    attendancePercent: 68,
    isAtRisk: true,
    riskReasons: [
      'Active Backlog in Thermodynamics II',
      'Training attendance 68% (borderline warning)',
      'Low software/coding transition readiness'
    ],
    placementStatus: 'Unplaced',
    offersCount: 0
  },
  {
    id: 'std-108',
    usn: '1RM21CS089',
    name: 'Sneha Chawla',
    email: 'sneha.c@campuslink.edu',
    phone: '+91 98201 55432',
    branch: 'CSE',
    batch: '2026 Batch',
    cgpa: 8.75,
    tenthPercentage: 92.0,
    twelfthPercentage: 90.5,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    readinessScore: 89,
    tier: 'Corporate Ready',
    skills: [
      { name: 'Fullstack MERN Stack', category: 'Frameworks', level: 5 },
      { name: 'Cloud Native / AWS', category: 'Cloud & DevOps', level: 4 },
      { name: 'Data Structures & Algorithms', category: 'Technical', level: 4 },
      { name: 'GraphQL & REST APIs', category: 'Technical', level: 4 },
      { name: 'Team Collaboration', category: 'Soft Skills', level: 5 }
    ],
    certifications: ['AWS Certified Developer Associate', 'Rooman Full Stack Specialist'],
    projectsCount: 4,
    topProjects: [
      {
        title: 'FinTech Micro-Lending Portal',
        tech: ['Next.js', 'Node.js', 'Stripe', 'PostgreSQL'],
        description: 'Peer-to-peer micro loan disbursement with automated KYC verification.'
      }
    ],
    projects: [
      {
        id: 'prj-108-1',
        title: 'FinTech Micro-Lending & Instant KYC Portal',
        domain: 'FinTech & Web3',
        tech: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe API', 'Tailwind CSS'],
        description: 'Compliant peer-to-peer micro-lending web application with Aadhaar/PAN mock e-KYC and automated credit scoring.',
        githubUrl: 'https://github.com/snehachawla/fintech-microlend',
        demoUrl: 'https://microlend-app.vercel.app',
        impact: 'Facilitated ₹12L+ in simulated disbursements with instant credit checks.'
      }
    ],
    internships: [
      {
        id: 'int-108-1',
        company: 'Rooman Technologies',
        role: 'Full Stack Web Trainee',
        duration: 'Jan 2025 - Apr 2025 (4 Months)',
        stipend: '₹22,000/month',
        description: 'Built customer portal components in React/Next.js and developed backend REST APIs for student attendance tracking.',
        skillsUsed: ['React', 'Next.js', 'Node.js', 'MongoDB'],
        certificateUrl: 'https://credentials.rooman.net/verify/INT-2025-FS-104',
        verified: true
      }
    ],
    programs: [
      {
        id: 'prg-108-1',
        title: 'Rooman Full-Stack Web Development Immersion',
        provider: 'Rooman Technologies',
        category: 'Full Stack',
        completionDate: 'Dec 2024',
        credentialId: 'RMN-FSW-8819',
        scoreOrGrade: 'Grade A+ (96%)',
        verified: true
      }
    ],
    resume: {
      atsScore: 91,
      lastUpdated: '2026-09-16',
      fileName: 'Sneha_Chawla_FullStack_Resume.pdf',
      summary: 'Computer Science senior with proven full-stack product building experience, AWS developer certified, 350+ LeetCode problems.',
      keyKeywordsMatched: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS', 'REST API', 'GraphQL', 'Data Structures'],
      missingKeywords: ['Kubernetes', 'Microservices'],
      improvements: ['Highlight performance metrics and database query tuning in FinTech project.']
    },
    apaarRecord: {
      apaarId: '9841-7782-4419',
      abcId: 'ABC-992-104-558',
      digiLockerVerified: true,
      totalCreditsEarned: 146,
      totalCreditsRequired: 160,
      creditTransferStatus: 'Fully Synchronized',
      semesterRecords: [
        { semester: 1, sgpa: 8.60, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2023' },
        { semester: 2, sgpa: 8.70, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2023' },
        { semester: 3, sgpa: 8.80, creditsEarned: 25, backlogs: 0, monthYear: 'Jan 2024' },
        { semester: 4, sgpa: 8.90, creditsEarned: 25, backlogs: 0, monthYear: 'Jul 2024' },
        { semester: 5, sgpa: 8.70, creditsEarned: 24, backlogs: 0, monthYear: 'Jan 2025' },
        { semester: 6, sgpa: 8.85, creditsEarned: 24, backlogs: 0, monthYear: 'Jul 2025' }
      ],
      universityRegNo: 'VTU-2021-CS-089',
      collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
      degreeTitle: 'Bachelor of Engineering (B.E.) Computer Science & Engineering',
      lastSyncDate: '2026-09-18'
    },
    prePlacementTalksAttended: ['ppt-rooman-01', 'ppt-google-02', 'ppt-deloitte-04'],
    leetcodeSolved: 350,
    githubRepos: 27,
    mockInterviewScore: 90,
    aptitudeScore: 89,
    attendancePercent: 95,
    isAtRisk: false,
    placementStatus: 'Offered',
    offersCount: 2,
    highestPackageLPA: 14.0
  }
];

export const INITIAL_PRE_TALKS: PlacementPreTalk[] = [
  {
    id: 'ppt-rooman-01',
    driveId: 'drv-rooman-01',
    companyName: 'Rooman Technologies',
    logo: '🏢',
    date: '2026-09-24',
    time: '09:30 AM - 10:45 AM',
    speaker: {
      name: 'Manish Kumar',
      designation: 'Head of Campus Talent & Enterprise Cloud Solutions'
    },
    venueOrLink: 'Main Auditorium (Hybrid Stream: meet.rooman.net/campus-ppt)',
    mode: 'Hybrid',
    mandatoryForBranches: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE'],
    registeredCount: 184,
    topics: [
      'Rooman Enterprise Cloud Architecture & Nationwide Projects',
      'Associate Cloud & AI Solutions Engineer Role Hierarchy',
      'CTC Breakdown: ₹8.5 LPA (₹7.5 LPA Fixed + ₹1.0 LPA Retention Bonus)',
      'Training Period, Probation, and Client Deployment Model',
      'Interactive Live Q&A with Engineering Leads'
    ],
    ctcOverview: '₹8.50 LPA + ₹30,000/mo Internship Stipend during 8th Semester',
    recordingOrDeckUrl: 'https://campus.rooman.net/decks/Rooman_Campus_2026_PreTalk.pdf',
    status: 'Scheduled',
    registeredStudentIds: ['std-101', 'std-102', 'std-103', 'std-104', 'std-106', 'std-107', 'std-108'],
    qnaCount: 18
  },
  {
    id: 'ppt-google-02',
    driveId: 'drv-google-02',
    companyName: 'Google Cloud India',
    logo: '🌐',
    date: '2026-09-27',
    time: '11:00 AM - 12:30 PM',
    speaker: {
      name: 'Anjali Ramanathan',
      designation: 'Staff Site Reliability Engineer & University Programs Lead'
    },
    venueOrLink: 'Google Meet (meet.google.com/xyz-gcp-placement)',
    mode: 'Virtual Live Stream',
    mandatoryForBranches: ['CSE', 'IT', 'AI&DS'],
    registeredCount: 128,
    topics: [
      'Life as a Cloud Application Engineer at Google Cloud India',
      'Understanding Distributed Scale: GCP Spanner, BigQuery, and Borg',
      'Interview Preparation: Problem Solving, Algorithmic Rigor & Googliness',
      'Compensation Breakdown: ₹24.0 LPA (Base + Performance Bonus + GSUs)'
    ],
    ctcOverview: '₹24.0 LPA + ₹85,000/mo Pre-Placement Internship Stipend',
    recordingOrDeckUrl: 'https://careers.google.com/campus/gcp-2026-deck.pdf',
    status: 'Scheduled',
    registeredStudentIds: ['std-101', 'std-102', 'std-108'],
    qnaCount: 32
  },
  {
    id: 'ppt-cisco-03',
    driveId: 'drv-cisco-03',
    companyName: 'Cisco Systems',
    logo: '📡',
    date: '2026-09-25',
    time: '02:00 PM - 03:30 PM',
    speaker: {
      name: 'Vikram Sethi',
      designation: 'Director of Engineering, Core Networking Software'
    },
    venueOrLink: 'Campus Seminar Hall 1 & Webex Stream',
    mode: 'Hybrid',
    mandatoryForBranches: ['CSE', 'IT', 'ECE', 'AI&DS'],
    registeredCount: 146,
    topics: [
      'Next-Gen Networking: Silicon One, SDN, and Cloud Networking',
      'Associate Network Software Engineer Career Path',
      'CTC Details: ₹17.5 LPA with comprehensive health & relocation benefits',
      'Technical assessment syllabus: Data Structures + Computer Networks (TCP/IP)'
    ],
    ctcOverview: '₹17.5 LPA + ₹60,000/mo Internship Stipend',
    recordingOrDeckUrl: 'https://cisco.webex.com/recordings/cisco-ppt-2026',
    status: 'Scheduled',
    registeredStudentIds: ['std-101', 'std-102', 'std-104'],
    qnaCount: 24
  },
  {
    id: 'ppt-deloitte-04',
    driveId: 'drv-deloitte-04',
    companyName: 'Deloitte USI',
    logo: '💼',
    date: '2026-09-23',
    time: '10:00 AM - 11:30 AM',
    speaker: {
      name: 'Ritu Kapoor',
      designation: 'Managing Director, Technology & Cloud Transformation'
    },
    venueOrLink: 'Main Auditorium',
    mode: 'In-Person Auditorium',
    mandatoryForBranches: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical'],
    registeredCount: 220,
    topics: [
      'Technology Consulting in the Era of Generative AI & Cloud',
      'Analyst Career Progression & Client Exposure Across US/India',
      'CTC Breakdown: ₹9.0 LPA (₹8.0 LPA Fixed + ₹1.0 LPA Performance Bonus)',
      'Aptitude Test Pattern & Group Discussion Guidelines'
    ],
    ctcOverview: '₹9.0 LPA + ₹35,000/mo Internship',
    recordingOrDeckUrl: 'https://deloitte.campus.in/deloitte-usi-tech-deck.pdf',
    status: 'Completed',
    registeredStudentIds: ['std-102', 'std-103', 'std-106', 'std-108'],
    qnaCount: 45
  }
];

export const INITIAL_DRIVES: RecruiterDrive[] = [
  {
    id: 'drv-rooman-01',
    companyName: 'Rooman Technologies',
    logo: '🏢',
    roleTitle: 'Associate Cloud & AI Solutions Engineer',
    jobType: 'Full-Time',
    ctcLPA: 8.5,
    stipendMonthly: 30000,
    location: 'Bengaluru / Hyderabad (Hybrid)',
    minCGPA: 7.0,
    eligibleBranches: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE'],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Python', 'Cloud Basics (AWS/Azure)', 'Linux Shell', 'Data Structures', 'REST APIs'],
    preferredSkills: ['Docker', 'GenAI Prompting', 'FastAPI'],
    driveDate: '2026-09-24',
    deadlineDate: '2026-09-22',
    status: 'Shortlisting',
    venueOrPlatform: 'On-Campus (Auditorium & Virtual Lab 2)',
    rounds: [
      { name: 'Pre-Placement Talk & Q&A', date: '2026-09-24', time: '09:30 AM', type: 'Offline', venue: 'Main Auditorium' },
      { name: 'Online Aptitude & Coding Test', date: '2026-09-24', time: '11:00 AM', type: 'Online', venue: 'Computer Lab 1 & 2' },
      { name: 'Technical Evaluation Round', date: '2026-09-25', time: '10:00 AM', type: 'Offline', venue: 'Placement Boardroom 1-4' },
      { name: 'Managerial & HR Fitment', date: '2026-09-25', time: '03:30 PM', type: 'Offline', venue: 'Conference Hall B' }
    ],
    shortlistedCount: 38,
    registeredCount: 142,
    selectedCount: 8,
    description: 'Rooman Technologies is hiring dynamic fresh engineers to deploy scalable Cloud, EdTech, and AI infrastructure solutions across nationwide enterprise implementations.'
  },
  {
    id: 'drv-google-02',
    companyName: 'Google Cloud India',
    logo: '🌐',
    roleTitle: 'Cloud Application Engineer (GCP)',
    jobType: 'Full-Time',
    ctcLPA: 24.0,
    stipendMonthly: 85000,
    location: 'Bengaluru / Hyderabad',
    minCGPA: 8.5,
    eligibleBranches: ['CSE', 'IT', 'AI&DS'],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Data Structures & Algorithms', 'Distributed Systems', 'C++ or Java or Go', 'GCP / Cloud Native'],
    preferredSkills: ['Kubernetes', 'High Scale Microservices', 'Open Source Contributions'],
    driveDate: '2026-09-28',
    deadlineDate: '2026-09-25',
    status: 'Registration Open',
    venueOrPlatform: 'Google Meet Virtual Drive',
    rounds: [
      { name: 'CodeSignal Online Coding Assessment', date: '2026-09-28', time: '10:00 AM', type: 'Online', venue: 'HackerEarth / ProctorLab' },
      { name: 'Technical Round 1 (Problem Solving & DSA)', date: '2026-09-30', time: '11:30 AM', type: 'Online', venue: 'Google Meet Room A' },
      { name: 'Technical Round 2 (System Architecture)', date: '2026-09-30', time: '02:30 PM', type: 'Online', venue: 'Google Meet Room B' },
      { name: 'Googliness & Leadership', date: '2026-10-01', time: '11:00 AM', type: 'Online', venue: 'Google Meet Exec' }
    ],
    shortlistedCount: 19,
    registeredCount: 88,
    selectedCount: 2,
    description: 'Join the Google Cloud infrastructure and developer solutions engineering team. Designing scalable customer migration pipelines and high throughput enterprise software.'
  },
  {
    id: 'drv-cisco-03',
    companyName: 'Cisco Systems',
    logo: '📡',
    roleTitle: 'Associate Software & Network Engineer',
    jobType: 'Full-Time',
    ctcLPA: 17.5,
    stipendMonthly: 60000,
    location: 'Bengaluru',
    minCGPA: 7.75,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'AI&DS'],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Computer Networks (TCP/IP)', 'Python / C++', 'Linux Kernel Basics', 'Operating Systems'],
    preferredSkills: ['Wireshark', 'CCNA Knowledge', 'Docker'],
    driveDate: '2026-09-26',
    deadlineDate: '2026-09-23',
    status: 'Assessment Active',
    venueOrPlatform: 'Campus Lab 3 + Webex',
    rounds: [
      { name: 'Network & DSA Online Test', date: '2026-09-26', time: '10:30 AM', type: 'Online', venue: 'Computer Lab 3' },
      { name: 'Technical Interview (Networks & Protocols)', date: '2026-09-27', time: '09:30 AM', type: 'Offline', venue: 'Seminar Hall 1' },
      { name: 'Executive HR Round', date: '2026-09-27', time: '04:00 PM', type: 'Offline', venue: 'TPO Interview Cell' }
    ],
    shortlistedCount: 26,
    registeredCount: 110,
    selectedCount: 5,
    description: 'Cisco Enterprise Networking Group is hiring passionate graduates for next-generation Software Defined Networking (SDN) and automated switching software.'
  },
  {
    id: 'drv-deloitte-04',
    companyName: 'Deloitte USI',
    logo: '💼',
    roleTitle: 'Analyst - Technology Consulting',
    jobType: 'Full-Time',
    ctcLPA: 9.0,
    stipendMonthly: 35000,
    location: 'Bengaluru / Gurugram',
    minCGPA: 6.75,
    eligibleBranches: ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical'],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Problem Solving & Analytical Ability', 'SQL or Python', 'Basic Cloud Awareness', 'Business Communication'],
    preferredSkills: ['Power BI', 'Agile Methodologies', 'Client Consulting'],
    driveDate: '2026-09-29',
    deadlineDate: '2026-09-26',
    status: 'Upcoming',
    venueOrPlatform: 'Auditorium & Virtual Interviews',
    rounds: [
      { name: 'Deloitte Versant & Cognitive Aptitude', date: '2026-09-29', time: '09:00 AM', type: 'Online', venue: 'Computer Lab 1 & 2' },
      { name: 'Case Study & Technical Assessment', date: '2026-09-29', time: '02:00 PM', type: 'Offline', venue: 'Seminar Hall 2' },
      { name: 'Partner & HR Interview', date: '2026-09-30', time: '10:00 AM', type: 'Offline', venue: 'TPO Suites' }
    ],
    shortlistedCount: 45,
    registeredCount: 165,
    selectedCount: 12,
    description: 'Deloitte USI Technology Consulting drives digital transformations for global Fortune 500 enterprises spanning ERP, cloud migration, and AI modernization.'
  }
];

export const INITIAL_SCHEDULE_SLOTS: DriveScheduleSlot[] = [
  {
    id: 'slot-1',
    driveId: 'drv-rooman-01',
    companyName: 'Rooman Technologies',
    roundName: 'Online Aptitude & Coding Assessment',
    date: '2026-09-24',
    startTime: '11:00',
    endTime: '13:00',
    venue: 'Computer Lab 1 (120 PCs)',
    interviewerCount: 4,
    studentBatch: 'Cohort A (CSE, IT, AI&DS - 142 Students)',
    hasConflict: true,
    conflictDetails: [
      'Lab 1 simultaneously reserved by VTU Departmental Semester Practicals (10:00 - 13:00)'
    ]
  },
  {
    id: 'slot-2',
    driveId: 'drv-cisco-03',
    companyName: 'Cisco Systems',
    roundName: 'Network & DSA Online Assessment',
    date: '2026-09-26',
    startTime: '10:30',
    endTime: '12:30',
    venue: 'Computer Lab 3 (80 PCs)',
    interviewerCount: 6,
    studentBatch: 'Shortlisted ECE & CSE (110 Students)',
    hasConflict: false
  },
  {
    id: 'slot-3',
    driveId: 'drv-rooman-01',
    companyName: 'Rooman Technologies',
    roundName: 'Technical Evaluation (4 Parallel Panels)',
    date: '2026-09-25',
    startTime: '10:00',
    endTime: '16:00',
    venue: 'Placement Boardroom 1-4',
    interviewerCount: 8,
    studentBatch: 'Shortlisted Round 1 Cleared (38 Candidates)',
    hasConflict: false
  },
  {
    id: 'slot-4',
    driveId: 'drv-google-02',
    companyName: 'Google Cloud India',
    roundName: 'CodeSignal Online Assessment',
    date: '2026-09-28',
    startTime: '10:00',
    endTime: '12:00',
    venue: 'Virtual Proctored (HackerEarth)',
    interviewerCount: 10,
    studentBatch: 'All Eligible 8.5+ CGPA (88 Students)',
    hasConflict: false
  }
];

export const INITIAL_CONFLICTS: ScheduleConflict[] = [
  {
    id: 'cnf-1',
    type: 'Venue Clashing',
    severity: 'High',
    description: 'Computer Lab 1 is reserved simultaneously for Rooman Technologies Coding Assessment and 5th Sem Operating Systems Lab Exam on Sept 24 (11:00 - 13:00).',
    involvedItems: ['Rooman Technologies Assessment', '5th Sem OS Lab Exam', 'Computer Lab 1'],
    recommendedResolution: 'Shift the Rooman Coding Assessment to Computer Lab 2 and Virtual Proctored mode, shifting start time to 13:30 post-lunch.'
  },
  {
    id: 'cnf-2',
    type: 'Academic Exam Clash',
    severity: 'Medium',
    description: 'Cisco Systems Interview Round on Sept 27 afternoon clashes with ECE Department Mid-Term Internal Test.',
    involvedItems: ['Cisco Systems Technical Round', 'ECE Department Mid-Terms'],
    recommendedResolution: 'Issue institutional clearance waiver requesting ECE HoD to reschedule internal test to Sept 29.'
  }
];

export const INITIAL_OFFERS: OfferRecord[] = [
  {
    id: 'off-501',
    studentId: 'std-102',
    studentName: 'Priyanka Sen',
    usn: '1RM21IS019',
    branch: 'IT',
    companyName: 'Google Cloud India',
    role: 'Cloud Application Engineer',
    ctcLPA: 22.0,
    offerLetterDate: '2026-09-12',
    acceptanceDeadline: '2026-09-25',
    joiningDate: '2027-07-05',
    workLocation: 'Bengaluru Urban',
    status: 'Joined',
    bondYears: 0,
    documents: [
      { name: '10th & 12th Marks Card', verified: true, required: true, fileUploaded: 'Priyanka_Sen_10_12_Marks.pdf' },
      { name: 'All Semester Marksheets (1-6)', verified: true, required: true, fileUploaded: 'Priyanka_Sen_Sem1_6.pdf' },
      { name: 'Provisional Degree / Bonafide', verified: true, required: true, fileUploaded: 'Bonafide_Rooman_Signed.pdf' },
      { name: 'PAN & Aadhaar Card KYC', verified: true, required: true, fileUploaded: 'Aadhaar_PAN_eKYC.pdf' },
      { name: 'Pre-Employment Medical Fitness', verified: true, required: true, fileUploaded: 'Medical_Fitness_Apollo.pdf' }
    ],
    notes: 'Document verification completed. Welcome kit dispatched by Google HR.'
  },
  {
    id: 'off-502',
    studentId: 'std-101',
    studentName: 'Aarav Sharma',
    usn: '1RM21CS042',
    branch: 'CSE',
    companyName: 'Cisco Systems',
    role: 'Software Engineer - Enterprise',
    ctcLPA: 16.5,
    offerLetterDate: '2026-09-15',
    acceptanceDeadline: '2026-09-28',
    joiningDate: '2027-08-01',
    workLocation: 'Bengaluru SEZ',
    status: 'Verified',
    bondYears: 1,
    documents: [
      { name: '10th & 12th Marks Card', verified: true, required: true, fileUploaded: 'Aarav_Marks.pdf' },
      { name: 'All Semester Marksheets (1-6)', verified: true, required: true, fileUploaded: 'Aarav_Sem1_6.pdf' },
      { name: 'College Clearance Certificate', verified: true, required: true, fileUploaded: 'No_Dues_Signed.pdf' },
      { name: 'PAN & Aadhaar Card KYC', verified: true, required: true, fileUploaded: 'Aarav_KYC.pdf' }
    ],
    notes: 'Accepted offer letter signed on Sept 16. Background verification in progress.'
  },
  {
    id: 'off-503',
    studentId: 'std-108',
    studentName: 'Sneha Chawla',
    usn: '1RM21CS089',
    branch: 'CSE',
    companyName: 'Rooman Technologies',
    role: 'Associate Cloud & AI Solutions Engineer',
    ctcLPA: 8.5,
    offerLetterDate: '2026-09-18',
    acceptanceDeadline: '2026-09-30',
    joiningDate: '2027-06-15',
    workLocation: 'Bengaluru HQ',
    status: 'Accepted',
    bondYears: 1,
    documents: [
      { name: '10th & 12th Marks Card', verified: true, required: true, fileUploaded: 'Sneha_10_12.pdf' },
      { name: 'All Semester Marksheets', verified: false, required: true },
      { name: 'PAN Card', verified: true, required: true, fileUploaded: 'Sneha_PAN.pdf' },
      { name: 'Aadhaar Card', verified: false, required: true }
    ],
    notes: 'Offer accepted. Reminder dispatched for pending Semester 6 marksheet upload.'
  }
];

export const INITIAL_NOTIFICATIONS: BroadcastNotification[] = [
  {
    id: 'ntf-1',
    title: 'Rooman Technologies Drive - Round 1 Shortlist Released',
    channel: 'WhatsApp',
    recipientsCount: 38,
    audience: 'Eligible Shortlisted Candidates',
    message: 'Dear Candidate, Congratulations! You have been shortlisted for Round 2 (Technical Evaluation) for Rooman Technologies. Please report to Placement Boardroom 1 on Sept 25 at 09:30 AM with 2 hard copies of your resume.',
    sentAt: '2026-09-18 17:30',
    status: 'Delivered',
    openRatePercent: 98
  },
  {
    id: 'ntf-2',
    title: 'Mandatory Aptitude Mock Assessment #4 - Final Reminder',
    channel: 'Email',
    recipientsCount: 240,
    audience: 'All Unplaced Final Year Students',
    message: 'Notice from Rooman Technologies Placement Cell: The final mandatory online aptitude mock assessment will commence tomorrow at 10:00 AM on the CAMPUSLINK portal. Attendance is mandatory for upcoming Tier-1 drives.',
    sentAt: '2026-09-17 11:00',
    status: 'Delivered',
    openRatePercent: 92
  }
];

export const INITIAL_STATS: PlacementStats = {
  totalEligible: 480,
  totalPlaced: 362,
  placementRate: 75.4,
  avgPackageLPA: 8.85,
  highestPackageLPA: 24.0,
  medianPackageLPA: 7.8,
  totalOffers: 428,
  activeDrives: 4,
  upcomingDrives: 8,
  atRiskCount: 34,
  branchPlacements: [
    { branch: 'CSE', total: 150, placed: 132, avgLPA: 11.2 },
    { branch: 'IT', total: 90, placed: 81, avgLPA: 10.4 },
    { branch: 'AI&DS', total: 60, placed: 49, avgLPA: 9.8 },
    { branch: 'ECE', total: 80, placed: 54, avgLPA: 7.6 },
    { branch: 'EEE', total: 40, placed: 24, avgLPA: 6.5 },
    { branch: 'Mechanical', total: 60, placed: 22, avgLPA: 5.4 }
  ],
  tierDistribution: [
    { tier: 'Super Dream (>12 LPA)', count: 68, percentage: 18.8, range: '> 12 LPA' },
    { tier: 'Dream (7-12 LPA)', count: 174, percentage: 48.1, range: '7 - 12 LPA' },
    { tier: 'Regular (4-7 LPA)', count: 98, percentage: 27.1, range: '4 - 7 LPA' },
    { tier: 'Mass Recruit (3-4 LPA)', count: 22, percentage: 6.0, range: '3 - 4 LPA' }
  ],
  funnelData: [
    { stage: 'Eligible Enrolled', count: 480, dropRate: 0 },
    { stage: 'Attended PPT & Applied', count: 442, dropRate: 7.9 },
    { stage: 'Aptitude & Coding Cleared', count: 268, dropRate: 39.3 },
    { stage: 'Technical Interviews', count: 184, dropRate: 31.3 },
    { stage: 'Final Offers Issued', count: 142, dropRate: 22.8 },
    { stage: 'Accepted & Verified', count: 136, dropRate: 4.2 }
  ]
};

export const INITIAL_APPLICATIONS: StudentApplication[] = [
  {
    id: 'app-01',
    studentId: 'std-101',
    driveId: 'drv-01',
    companyName: 'Amazon Web Services',
    roleTitle: 'Cloud Support Associate & SDE',
    logo: 'AWS',
    ctcLPA: 19.5,
    appliedDate: '2026-10-02',
    status: 'Technical Interview',
    currentRound: 'System Design & DSA (Bar Raiser)',
    nextStepDeadline: 'Today, 2:30 PM (Audi A / Panel 2)',
    feedback: 'Strong performance on algorithmic round. Solved Trie & Dijkstra problems with clean code.'
  },
  {
    id: 'app-02',
    studentId: 'std-101',
    driveId: 'drv-02',
    companyName: 'Cisco Systems',
    roleTitle: 'Software Engineer - Enterprise Networking',
    logo: 'CSCO',
    ctcLPA: 17.8,
    appliedDate: '2026-09-28',
    status: 'Offered',
    currentRound: 'Offer Clearance & Verification',
    nextStepDeadline: 'Accept by Oct 18, 2026',
    feedback: 'Recommended for Hire. Demonstrated deep packet routing and Go concurrency knowledge.'
  },
  {
    id: 'app-03',
    studentId: 'std-101',
    driveId: 'drv-03',
    companyName: 'Siemens Healthineers',
    roleTitle: 'AI Research & Medical Imaging Intern',
    logo: 'SIEM',
    ctcLPA: 14.5,
    appliedDate: '2026-10-05',
    status: 'Assessment Active',
    currentRound: 'HackerRank Python & ML Assessment',
    nextStepDeadline: 'Due in 2 days (Oct 13, 2026)',
    feedback: 'Shortlisted based on CGPA (8.92) and Computer Vision project portfolio.'
  },
  {
    id: 'app-04',
    studentId: 'std-101',
    driveId: 'drv-04',
    companyName: 'Schneider Electric',
    roleTitle: 'IoT Platform Engineer',
    logo: 'SCHN',
    ctcLPA: 11.2,
    appliedDate: '2026-09-20',
    status: 'Shortlisted',
    currentRound: 'Technical Round 1',
    nextStepDeadline: 'Scheduled Oct 16, 2026',
    feedback: 'Resume cleared ATS filter with 92% match score.'
  }
];

export const INITIAL_PEER_INSIGHTS: PeerInterviewInsight[] = [
  {
    id: 'pi-01',
    companyName: 'Amazon Web Services',
    roleTitle: 'Cloud Support Associate & SDE',
    studentName: 'Kavya Narayanan',
    usn: '1RM20CS088',
    batch: '2025 Alumni',
    verdict: 'Selected & Joined',
    difficulty: 'Challenging',
    rating: 5,
    datePosted: 'Aug 2025',
    roundsSummary: [
      {
        roundName: 'Round 1: Online Assessment (90 Mins)',
        summary: '2 Coding questions on HackerRank + 15 Work Style Assessment questions.',
        sampleQuestions: [
          'Optimal Path with Minimum Cost in a Grid (Dijkstra variation)',
          'Subarray Sum Divisible by K with HashMap'
        ]
      },
      {
        roundName: 'Round 2: Technical Deep Dive & System Basics (60 Mins)',
        summary: 'Live coding on Amazon Chime with 2 engineers. Deep questions on Linux internals, DNS lookups, TCP 3-way handshake.',
        sampleQuestions: [
          'What exactly happens when you type https://aws.amazon.com in the browser?',
          'Implement an LRU Cache with O(1) get and put operations'
        ]
      },
      {
        roundName: 'Round 3: Bar Raiser & Leadership Principles (60 Mins)',
        summary: 'Senior Manager from Dublin office. 70% STAR behavioral questions mapped to Customer Obsession and Bias for Action.',
        sampleQuestions: [
          'Tell me about a time you had a fundamental disagreement with a teammate and how you resolved it.',
          'Describe a complex project where you had to make a trade-off under strict deadlines.'
        ]
      }
    ],
    topTips: [
      'Master the STAR (Situation, Task, Action, Result) methodology — Amazon interviewers literally take typed notes on each part!',
      'Review OS and Computer Networks thoroughly (DNS, OSI model, subnetting, processes vs threads).',
      'Always clarify requirements and edge cases before jumping to code.'
    ],
    preparationMaterialsUsed: [
      'LeetCode Top Amazon Questions (Last 6 Months)',
      'Rooman AWS Immersion Lab Notes',
      'Cracking the Coding Interview (Behavioral Chapter)'
    ],
    verifiedByTPO: true
  },
  {
    id: 'pi-02',
    companyName: 'Cisco Systems',
    roleTitle: 'Software Engineer',
    studentName: 'Rohan Deshmukh',
    usn: '1RM20IS045',
    batch: '2025 Alumni',
    verdict: 'Selected & Joined',
    difficulty: 'Moderate',
    rating: 4,
    datePosted: 'Sep 2025',
    roundsSummary: [
      {
        roundName: 'Round 1: Aptitude + Technical MCQ + Coding',
        summary: 'Network protocol MCQs (BGP, OSPF, VLANs), C/C++ output prediction, and 1 dynamic programming question.',
        sampleQuestions: ['Longest Common Subsequence', 'Subnet mask calculation for class C']
      },
      {
        roundName: 'Round 2: Managerial & Core Architecture',
        summary: 'Walkthrough of final year project. They probed into database indexing choices and API latency bottlenecks.',
        sampleQuestions: [
          'Why did you choose Redis over Memcached for your cache tier?',
          'How would you detect memory leaks in a long-running C++ microservice?'
        ]
      }
    ],
    topTips: [
      'Know every line of code on your GitHub projects — they will ask you to open your repo live on screen.',
      'Cisco loves candidates with solid fundamentals over fancy buzzwords.'
    ],
    preparationMaterialsUsed: ['GeeksforGeeks Cisco Interview Archive', 'Kurose & Ross Computer Networking'],
    verifiedByTPO: true
  },
  {
    id: 'pi-03',
    companyName: 'Siemens Healthineers',
    roleTitle: 'AI Research & Medical Imaging',
    studentName: 'Sneha Patel',
    usn: '1RM21AI019',
    batch: '2026 Batch',
    verdict: 'Made Final Round',
    difficulty: 'Challenging',
    rating: 4,
    datePosted: 'Oct 2026',
    roundsSummary: [
      {
        roundName: 'Round 1: Python Data Science & ML Test',
        summary: 'Numpy matrix manipulations, PyTorch tensor broadcasting, and precision/recall trade-offs in medical diagnostics.',
        sampleQuestions: ['Implement IoU (Intersection over Union) from scratch in Numpy', 'Explain vanishing gradient in deep CNNs']
      }
    ],
    topTips: [
      'Brush up on statistical validation (F1 score, ROC-AUC, confusion matrix). In healthcare AI, false negatives carry a severe penalty.',
      'Be honest about what you don’t know — they appreciate intellectual humility.'
    ],
    preparationMaterialsUsed: ['Deep Learning Specialization by Andrew Ng', 'Fast.ai Practical Deep Learning'],
    verifiedByTPO: true
  }
];

export const INITIAL_MOUS: CompanyMoU[] = [
  {
    id: 'mou-01',
    companyName: 'Amazon Web Services',
    logo: 'AWS',
    tier: 'Super Dream',
    status: 'Active MoU',
    signedOn: '2024-06-15',
    validUntil: '2027-06-14',
    targetHires: 35,
    actualHiresThisYear: 28,
    pocName: 'Vikram Sengupta',
    pocEmail: 'vikram.s@amazon.com',
    pocPhone: '+91 98450 11928',
    notes: 'Long-term Tier-1 Cloud partner. Includes AWS Academy accreditation credits and internship-to-PPO pipeline.'
  },
  {
    id: 'mou-02',
    companyName: 'Cisco Systems',
    logo: 'CSCO',
    tier: 'Tier-1 Dream',
    status: 'Active MoU',
    signedOn: '2023-08-01',
    validUntil: '2026-07-31',
    targetHires: 30,
    actualHiresThisYear: 32,
    pocName: 'Ananya Roy',
    pocEmail: 'ananyar@cisco.com',
    pocPhone: '+91 99120 44521',
    notes: 'Exceeded target hires. Center of Excellence (CoE) established for IoT & Software Defined Networking.'
  },
  {
    id: 'mou-03',
    companyName: 'Siemens Healthineers',
    logo: 'SIEM',
    tier: 'Tier-1 Dream',
    status: 'Renewal Pending',
    signedOn: '2023-11-10',
    validUntil: '2026-11-09',
    targetHires: 20,
    actualHiresThisYear: 16,
    pocName: 'Dr. Klaus Becker / Priya Nair',
    pocEmail: 'priya.nair@siemens-healthineers.com',
    pocPhone: '+91 97412 88310',
    notes: 'Renewal discussion in progress for 2027-2029 cycle. Offering 10 dual-track R&D master fellowships.'
  },
  {
    id: 'mou-04',
    companyName: 'Schneider Electric',
    logo: 'SCHN',
    tier: 'Core Engineering',
    status: 'Active MoU',
    signedOn: '2024-01-20',
    validUntil: '2027-01-19',
    targetHires: 25,
    actualHiresThisYear: 18,
    pocName: 'Harish Kulkarni',
    pocEmail: 'harish.kulkarni@se.com',
    pocPhone: '+91 98860 33145',
    notes: 'Core hiring for EEE, ECE, and Mechanical graduates in green energy automation.'
  },
  {
    id: 'mou-05',
    companyName: 'Microsoft Corporation',
    logo: 'MSFT',
    tier: 'Super Dream',
    status: 'Under Review',
    signedOn: '2024-10-01',
    validUntil: '2027-09-30',
    targetHires: 15,
    actualHiresThisYear: 8,
    pocName: 'Sanjay Chawla',
    pocEmail: 'sanjay.chawla@microsoft.com',
    pocPhone: '+91 98112 55201',
    notes: 'MoU draft awaiting institutional legal vetting for Azure cloud credits integration.'
  }
];

export const INITIAL_VOLUNTEERS: CoordinatorVolunteerTask[] = [
  {
    id: 'vol-01',
    volunteerName: 'Tanvi Joshi',
    usn: '1RM22CS112',
    branch: 'CSE',
    driveId: 'drv-01',
    companyName: 'Amazon Web Services',
    taskTitle: 'Panel 1 & 2 Interview Escort & Waiting Area Buffer Queue',
    venue: 'Seminar Hall 2 & Interview Rooms 1-3',
    timeSlot: '09:00 AM - 01:30 PM',
    status: 'In Progress',
    priority: 'High'
  },
  {
    id: 'vol-02',
    volunteerName: 'Nikhil Gowda',
    usn: '1RM22IS044',
    branch: 'IT',
    driveId: 'drv-01',
    companyName: 'Amazon Web Services',
    taskTitle: 'Lab 3 Online Coding Proctor & System Backup Incharge',
    venue: 'Computer Lab 3 (Turing Wing)',
    timeSlot: '10:00 AM - 02:00 PM',
    status: 'In Progress',
    priority: 'High'
  },
  {
    id: 'vol-03',
    volunteerName: 'Divya Reddy',
    usn: '1RM22EC031',
    branch: 'ECE',
    driveId: 'drv-02',
    companyName: 'Cisco Systems',
    taskTitle: 'First-Level Document Verification & APAAR Card Check',
    venue: 'Registration Desk, Ground Floor',
    timeSlot: '08:30 AM - 12:00 PM',
    status: 'Completed',
    priority: 'Normal'
  },
  {
    id: 'vol-04',
    volunteerName: 'Karthik Rao',
    usn: '1RM22AI028',
    branch: 'AI&DS',
    driveId: 'drv-03',
    companyName: 'Siemens Healthineers',
    taskTitle: 'Recruiter Hospitality & Guest House Transit Coordinator',
    venue: 'Executive Guest House to Auditorium A',
    timeSlot: '01:30 PM - 05:30 PM',
    status: 'Assigned',
    priority: 'Normal'
  }
];

export const INITIAL_GROUND_ISSUES: GroundIssueTicket[] = [
  {
    id: 'iss-01',
    title: 'Lab 3 Node 18 & 24 Offline during Coding Round',
    category: 'Lab WiFi / Power',
    severity: 'Critical',
    driveId: 'drv-01',
    companyName: 'Amazon Web Services',
    venue: 'Computer Lab 3 (Turing Wing)',
    reportedBy: 'Prof. Shalini Rao (Coordinator)',
    timestamp: '10:14 AM Today',
    status: 'Resolved',
    resolutionNotes: 'Network switch power cycled by IT Admin. Students relocated to buffer terminals Node 45 & 46 with 15 mins compensatory time.'
  },
  {
    id: 'iss-02',
    title: 'Candidate No-Show for Panel 2 Interview Slot (Aarav Verma)',
    category: 'Candidate No-Show',
    severity: 'Medium',
    driveId: 'drv-01',
    companyName: 'Amazon Web Services',
    venue: 'Interview Room 2',
    reportedBy: 'Tanvi Joshi (Student Volunteer)',
    timestamp: '11:05 AM Today',
    status: 'Action Taken',
    resolutionNotes: 'Candidate reached via WhatsApp emergency broadcast. Was caught in previous round verification. Next queued candidate bumped up.'
  },
  {
    id: 'iss-03',
    title: 'Panel 3 Recruiter Laptop HDMI Audio Sync Glitch',
    category: 'Lab WiFi / Power',
    severity: 'Low',
    driveId: 'drv-02',
    companyName: 'Cisco Systems',
    venue: 'Auditorium A',
    reportedBy: 'Karthik Rao (Volunteer)',
    timestamp: '09:25 AM Today',
    status: 'Resolved',
    resolutionNotes: 'Replaced with gold-plated USB-C to HDMI adapter from AV inventory.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    timestamp: '10:45 AM Today',
    actorName: 'Priya Sharma',
    actorRole: 'Recruiter',
    actionType: 'Stage Advanced',
    targetEntity: 'Aarav Sharma (std-101)',
    details: 'Advanced candidate from "Assessment Cleared" to "Technical Interview" for AWS Cloud Support Associate role.'
  },
  {
    id: 'aud-02',
    timestamp: '09:30 AM Today',
    actorName: 'Dr. Rajesh Hegde',
    actorRole: 'TPO',
    actionType: 'Drive Created',
    targetEntity: 'Siemens Healthineers (drv-03)',
    details: 'Approved and published AI Research drive with ₹14.5 LPA package and CGPA cut-off 7.5.'
  },
  {
    id: 'aud-03',
    timestamp: 'Yesterday, 04:15 PM',
    actorName: 'Prof. Shalini Rao',
    actorRole: 'Coordinator',
    actionType: 'Student Verified',
    targetEntity: 'Sneha Patel (std-103)',
    details: 'Verified DigiLocker APAAR ABC record and signed off 140 earned academic credits.'
  },
  {
    id: 'aud-04',
    timestamp: 'Yesterday, 02:00 PM',
    actorName: 'Dr. Rajesh Hegde',
    actorRole: 'TPO',
    actionType: 'Offer Issued',
    targetEntity: 'Cisco Systems (std-101)',
    details: 'Verified institutional KYC document package and cleared ₹17.8 LPA offer letter.'
  },
  {
    id: 'aud-05',
    timestamp: '2 days ago, 11:20 AM',
    actorName: 'Priya Sharma',
    actorRole: 'Recruiter',
    actionType: 'Permission Updated',
    targetEntity: 'Candidate Matching Filter',
    details: 'Relaxed backlog criteria to 1 for IT and AI&DS branches on recruiter drive.'
  }
];

export const INITIAL_APPROVAL_REQUESTS: DriveApprovalRequest[] = [
  {
    id: 'req-01',
    driveId: 'drv-01',
    companyName: 'Amazon Web Services',
    requestedBy: 'Prof. Shalini Rao (Coordinator)',
    requestType: 'Extra Round',
    description: 'Amazon talent team requested an additional 30-min Bar Raiser managerial interview for top 6 shortlisted candidates.',
    status: 'Pending TPO',
    submittedAt: 'Today, 10:30 AM'
  },
  {
    id: 'req-02',
    driveId: 'drv-02',
    companyName: 'Cisco Systems',
    requestedBy: 'Prof. Shalini Rao (Coordinator)',
    requestType: 'Venue Change',
    description: 'Relocate final HR rounds from Audi A Green Room to Executive Conference Room 2 for privacy.',
    status: 'Approved',
    submittedAt: 'Yesterday, 03:00 PM'
  },
  {
    id: 'req-03',
    driveId: 'drv-04',
    companyName: 'Schneider Electric',
    requestedBy: 'Harish Kulkarni (Recruiter)',
    requestType: 'Cutoff Waiver',
    description: 'Requesting 0.2 CGPA cutoff relaxation for 3 exceptional students with winning national Smart India Hackathon IoT projects.',
    status: 'Pending TPO',
    submittedAt: 'Today, 08:45 AM'
  }
];

