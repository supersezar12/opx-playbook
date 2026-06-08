/**
 * DEPARTMENTS_DATA
 * Maps each of the 20 industries to its real-world departments.
 * Each department has:
 *   - id          unique slug used in state
 *   - name        display name
 *   - emoji       visual identifier
 *   - subFocuses  3–5 department-specific focus areas that NARROW the industry
 *                 focuses; injected into the prompt as an extra context layer
 *   - typicalRoles  example job titles shown as hints in Step 1
 */

export interface Department {
  id: string;
  name: string;
  emoji: string;
  subFocuses: string[];
  typicalRoles: string[];
}

export interface IndustryDepartments {
  industry: string;
  departments: Department[];
}

export const DEPARTMENTS_DATA: IndustryDepartments[] = [
  // ── 1. Oil & Gas ──────────────────────────────────────────────────────────
  {
    industry: 'Oil & Gas',
    departments: [
      {
        id: 'og_drilling',
        name: 'Drilling & Well Operations',
        emoji: '🛢',
        subFocuses: ['Well Planning & Execution', 'Rig Safety Management', 'Directional Drilling Control', 'Well Integrity & Cementing'],
        typicalRoles: ['Drilling Engineer', 'Mud Logger', 'Driller', 'Tool Pusher', 'Well Site Supervisor'],
      },
      {
        id: 'og_hse',
        name: 'HSE & Environment',
        emoji: '🦺',
        subFocuses: ['Permit-to-Work Systems', 'Emergency Response Planning', 'Environmental Impact Monitoring', 'Incident Investigation & Reporting'],
        typicalRoles: ['HSE Officer', 'Safety Coordinator', 'Environmental Advisor', 'Process Safety Engineer'],
      },
      {
        id: 'og_production',
        name: 'Production & Operations',
        emoji: '⚙️',
        subFocuses: ['Production Optimisation', 'Separator & Compression Operations', 'Flow Assurance', 'Production Chemistry'],
        typicalRoles: ['Production Operator', 'Field Technician', 'Production Engineer', 'Operations Supervisor'],
      },
      {
        id: 'og_refinery',
        name: 'Refining & Processing',
        emoji: '🏭',
        subFocuses: ['Crude Distillation Operations', 'Catalytic Cracking & Reforming', 'Process Control & Instrumentation', 'Product Quality & Blending'],
        typicalRoles: ['Refinery Operator', 'Process Engineer', 'Quality Assurance Technician', 'Control Room Operator'],
      },
      {
        id: 'og_pipeline',
        name: 'Pipeline & Logistics',
        emoji: '🔩',
        subFocuses: ['Pipeline Integrity Management', 'SCADA & Control Systems', 'Crude Oil Transportation Scheduling', 'Metering & Custody Transfer'],
        typicalRoles: ['Pipeline Controller', 'Integrity Engineer', 'Logistics Coordinator', 'SCADA Technician'],
      },
      {
        id: 'og_finance',
        name: 'Finance & Commercial',
        emoji: '💼',
        subFocuses: ['Capital Project Cost Control', 'Commodity Hedging & Trading', 'Joint Venture Accounting', 'Revenue & Production Accounting'],
        typicalRoles: ['Cost Controller', 'Commercial Analyst', 'JV Accountant', 'Finance Manager'],
      },
    ],
  },

  // ── 2. Banking & Financial Services ──────────────────────────────────────
  {
    industry: 'Banking & Financial Services',
    departments: [
      {
        id: 'bfs_retail',
        name: 'Retail Banking',
        emoji: '🏦',
        subFocuses: ['Customer Onboarding & KYC', 'Consumer Loan Origination', 'Branch Teller Operations', 'Cross-Sell & Product Referral'],
        typicalRoles: ['Relationship Officer', 'Teller', 'Branch Manager', 'Personal Banker'],
      },
      {
        id: 'bfs_corporate',
        name: 'Corporate & Wholesale Banking',
        emoji: '🏢',
        subFocuses: ['Corporate Credit Structuring', 'Trade Finance & LC Issuance', 'Cash Management Solutions', 'Covenant Monitoring'],
        typicalRoles: ['Corporate Relationship Manager', 'Trade Finance Officer', 'Credit Analyst', 'Treasury Manager'],
      },
      {
        id: 'bfs_risk',
        name: 'Risk & Compliance',
        emoji: '🛡',
        subFocuses: ['Credit Risk Scoring & Modelling', 'AML & Sanctions Screening', 'Basel Regulatory Reporting', 'Operational Risk Assessment'],
        typicalRoles: ['Risk Analyst', 'Compliance Officer', 'AML Investigator', 'Regulatory Reporting Specialist'],
      },
      {
        id: 'bfs_digital',
        name: 'Digital Banking & Payments',
        emoji: '📱',
        subFocuses: ['Mobile App Feature Delivery', 'Payment Gateway Integration', 'Digital Fraud Prevention', 'UX & Customer Journey Optimisation'],
        typicalRoles: ['Digital Product Manager', 'Payments Analyst', 'Fraud Analyst', 'App Support Specialist'],
      },
      {
        id: 'bfs_treasury',
        name: 'Treasury & Capital Markets',
        emoji: '📈',
        subFocuses: ['Liquidity Coverage Ratio Management', 'FX & Interest Rate Hedging', 'Bond Issuance & Investor Relations', 'ALM Reporting'],
        typicalRoles: ['Treasury Dealer', 'ALM Analyst', 'Capital Markets Analyst', 'Chief Dealer'],
      },
    ],
  },

  // ── 3. Healthcare & Hospitals ─────────────────────────────────────────────
  {
    industry: 'Healthcare & Hospitals',
    departments: [
      {
        id: 'hh_clinical',
        name: 'Clinical Operations',
        emoji: '🏥',
        subFocuses: ['Patient Assessment & Triage', 'Clinical Protocol Adherence', 'Handover & Shift Briefing', 'Multidisciplinary Team Coordination'],
        typicalRoles: ['Nurse', 'Ward Sister', 'Physician', 'Clinical Lead', 'Consultant'],
      },
      {
        id: 'hh_pharmacy',
        name: 'Pharmacy & Medication Management',
        emoji: '💊',
        subFocuses: ['Drug Dispensing Accuracy', 'Formulary & Inventory Control', 'Pharmacovigilance Reporting', 'Patient Medication Counselling'],
        typicalRoles: ['Pharmacist', 'Pharmacy Technician', 'Clinical Pharmacist', 'Dispensary Manager'],
      },
      {
        id: 'hh_radiology',
        name: 'Radiology & Imaging',
        emoji: '🩻',
        subFocuses: ['Imaging Protocol Execution', 'Radiation Safety & Dose Management', 'PACS & RIS Operations', 'Radiologist Report Quality'],
        typicalRoles: ['Radiographer', 'Radiologist', 'MRI Technician', 'Imaging Department Manager'],
      },
      {
        id: 'hh_admin',
        name: 'Administration & Revenue Cycle',
        emoji: '📋',
        subFocuses: ['Patient Registration & Scheduling', 'Insurance Pre-Authorization', 'Medical Coding (ICD/CPT)', 'Billing & Claims Follow-Up'],
        typicalRoles: ['Medical Coder', 'Billing Specialist', 'Patient Services Coordinator', 'Revenue Cycle Manager'],
      },
      {
        id: 'hh_supply',
        name: 'Supply Chain & Procurement',
        emoji: '📦',
        subFocuses: ['Medical Consumables Inventory', 'Vendor Qualification & Contracting', 'Cold Chain & Pharmaceutical Storage', 'Purchase Order Management'],
        typicalRoles: ['Procurement Officer', 'Stores Manager', 'Supply Chain Coordinator', 'Logistics Supervisor'],
      },
    ],
  },

  // ── 4. Real Estate & Construction ─────────────────────────────────────────
  {
    industry: 'Real Estate & Construction',
    departments: [
      {
        id: 'rec_pm',
        name: 'Project Management',
        emoji: '🏗',
        subFocuses: ['Schedule & Milestone Planning', 'Subcontractor Management', 'Site Safety & Permits', 'Change Order Control'],
        typicalRoles: ['Project Manager', 'Site Engineer', 'Construction Manager', 'Planning Engineer'],
      },
      {
        id: 'rec_sales',
        name: 'Sales & Leasing',
        emoji: '🤝',
        subFocuses: ['Property Presentation & Viewing', 'Sales Pipeline & CRM Management', 'Offer Negotiation & Closing', 'Leasing Agreement Execution'],
        typicalRoles: ['Sales Agent', 'Leasing Executive', 'Property Consultant', 'Sales Manager'],
      },
      {
        id: 'rec_valuation',
        name: 'Valuation & Due Diligence',
        emoji: '📐',
        subFocuses: ['Market Comparable Analysis', 'Site & Building Inspection', 'Title & Legal Due Diligence', 'Investment Return Modelling'],
        typicalRoles: ['Valuer', 'Due Diligence Analyst', 'Asset Manager', 'Investment Analyst'],
      },
      {
        id: 'rec_fm',
        name: 'Facilities & Property Management',
        emoji: '🔑',
        subFocuses: ['Planned & Reactive Maintenance', 'Tenant Relations & Complaints', 'Service Charge Management', 'Building Systems & MEP Oversight'],
        typicalRoles: ['Facilities Manager', 'Property Manager', 'Maintenance Supervisor', 'Building Manager'],
      },
      {
        id: 'rec_finance',
        name: 'Finance & Capital Raising',
        emoji: '💰',
        subFocuses: ['Development Loan Structuring', 'Cash Flow & Drawdown Management', 'Investor Reporting', 'Cost & Budget Variance Analysis'],
        typicalRoles: ['Finance Controller', 'Investment Manager', 'Fund Accountant', 'CFO'],
      },
    ],
  },

  // ── 5. Telecommunications ─────────────────────────────────────────────────
  {
    industry: 'Telecommunications',
    departments: [
      {
        id: 'tel_network',
        name: 'Network Operations',
        emoji: '📡',
        subFocuses: ['NOC Incident Management', 'Network Performance KPIs', 'Fault Isolation & Escalation', 'Capacity Planning & Expansion'],
        typicalRoles: ['NOC Engineer', 'Network Analyst', 'RF Engineer', 'Network Operations Manager'],
      },
      {
        id: 'tel_sales',
        name: 'Sales & Distribution',
        emoji: '📲',
        subFocuses: ['Prepaid & Postpaid Activation', 'Dealer Channel Management', 'B2B Enterprise Sales', 'Retail Store Operations'],
        typicalRoles: ['Sales Representative', 'Account Manager', 'Channel Partner Manager', 'Retail Supervisor'],
      },
      {
        id: 'tel_customer',
        name: 'Customer Care',
        emoji: '🎧',
        subFocuses: ['First Call Resolution', 'Complaint Handling & Escalation', 'CSAT Improvement Initiatives', 'IVR & Digital Self-Service'],
        typicalRoles: ['Customer Service Agent', 'Team Leader', 'Quality Analyst', 'Contact Centre Manager'],
      },
      {
        id: 'tel_it',
        name: 'IT & Platform Engineering',
        emoji: '💻',
        subFocuses: ['BSS/OSS System Administration', 'API Integration & Middleware', 'Cybersecurity & Network Defence', 'Cloud Migration & DevOps'],
        typicalRoles: ['Software Engineer', 'Systems Administrator', 'DevOps Engineer', 'IT Manager'],
      },
      {
        id: 'tel_regulatory',
        name: 'Regulatory & Spectrum',
        emoji: '📜',
        subFocuses: ['Licence Renewal & Spectrum Filing', 'Regulatory Compliance Reporting', 'Government Relations', 'EMF & Infrastructure Permits'],
        typicalRoles: ['Regulatory Affairs Specialist', 'Legal Counsel', 'Government Relations Manager'],
      },
    ],
  },

  // ── 6. Retail & FMCG ──────────────────────────────────────────────────────
  {
    industry: 'Retail & FMCG',
    departments: [
      {
        id: 'fmcg_sales',
        name: 'Sales & Distribution',
        emoji: '🚚',
        subFocuses: ['Route-to-Market Planning', 'Distributor & Wholesaler Management', 'Van Sales Operations', 'Sales Target Setting & Tracking'],
        typicalRoles: ['Sales Representative', 'Area Sales Manager', 'Van Salesman', 'Key Account Executive'],
      },
      {
        id: 'fmcg_merchandising',
        name: 'Trade Marketing & Merchandising',
        emoji: '🛒',
        subFocuses: ['Shelf Space & Planogram Compliance', 'In-Store Promotions Execution', 'Point-of-Sale Material Management', 'Category & SKU Performance'],
        typicalRoles: ['Merchandiser', 'Trade Marketing Executive', 'Category Manager', 'Field Force Supervisor'],
      },
      {
        id: 'fmcg_scm',
        name: 'Supply Chain & Logistics',
        emoji: '📦',
        subFocuses: ['Demand Planning & S&OP', 'Warehouse Picking & Packing', 'Cold Chain Management', 'Last-Mile Delivery Optimisation'],
        typicalRoles: ['Supply Planner', 'Logistics Coordinator', 'Warehouse Supervisor', 'Distribution Manager'],
      },
      {
        id: 'fmcg_marketing',
        name: 'Brand & Marketing',
        emoji: '📣',
        subFocuses: ['Brand Campaign Planning', 'Consumer Insights & Research', 'Digital & Social Media Marketing', 'NPD & Pack Innovation'],
        typicalRoles: ['Brand Manager', 'Marketing Executive', 'Digital Marketing Specialist', 'Market Research Analyst'],
      },
      {
        id: 'fmcg_ops',
        name: 'Manufacturing & Quality',
        emoji: '🏭',
        subFocuses: ['Production Line Operations', 'GMP & Food Safety Standards', 'Quality Control & Shelf-Life Testing', 'OEE & Waste Reduction'],
        typicalRoles: ['Production Operator', 'QC Inspector', 'Factory Supervisor', 'Manufacturing Engineer'],
      },
    ],
  },

  // ── 7. Manufacturing ──────────────────────────────────────────────────────
  {
    industry: 'Manufacturing',
    departments: [
      {
        id: 'mfg_production',
        name: 'Production & Operations',
        emoji: '⚙️',
        subFocuses: ['Work Order & MES Management', 'Line Balancing & Throughput', 'Shift Handover Procedures', 'Scrap & Rework Control'],
        typicalRoles: ['Production Operator', 'Line Leader', 'Shift Supervisor', 'Operations Manager'],
      },
      {
        id: 'mfg_maintenance',
        name: 'Maintenance & Engineering',
        emoji: '🔧',
        subFocuses: ['Preventive Maintenance Scheduling', 'Breakdown Root Cause Analysis', 'Spare Parts & Stores Management', 'Equipment OEE Improvement'],
        typicalRoles: ['Maintenance Technician', 'Mechanical Engineer', 'Maintenance Planner', 'Plant Engineer'],
      },
      {
        id: 'mfg_quality',
        name: 'Quality Assurance & Control',
        emoji: '✅',
        subFocuses: ['Incoming Material Inspection', 'In-Process Quality Checks', 'Customer Complaint & 8D Reporting', 'ISO/IATF Audit Readiness'],
        typicalRoles: ['QC Inspector', 'Quality Engineer', 'QA Manager', 'Metrology Technician'],
      },
      {
        id: 'mfg_scm',
        name: 'Supply Chain & Procurement',
        emoji: '🔗',
        subFocuses: ['Supplier Qualification & Scorecard', 'Raw Material Planning & MRP', 'Inventory Optimisation', 'Import & Customs Clearance'],
        typicalRoles: ['Buyer', 'Materials Planner', 'Procurement Manager', 'Logistics Officer'],
      },
      {
        id: 'mfg_hse',
        name: 'Health, Safety & Environment',
        emoji: '🦺',
        subFocuses: ['Machine Guarding & Lockout/Tagout', 'Chemical Hazard Management', 'Near-Miss Reporting Culture', 'Environmental Permit Compliance'],
        typicalRoles: ['HSE Coordinator', 'Safety Officer', 'Environmental Engineer', 'HSE Manager'],
      },
    ],
  },

  // ── 8. Agriculture & Food Production ──────────────────────────────────────
  {
    industry: 'Agriculture & Food Production',
    departments: [
      {
        id: 'agr_farming',
        name: 'Field & Crop Management',
        emoji: '🌾',
        subFocuses: ['Crop Calendar & Planting Schedules', 'Fertiliser & Pesticide Application', 'Irrigation Scheduling', 'Yield Monitoring & Reporting'],
        typicalRoles: ['Farm Manager', 'Agronomist', 'Field Supervisor', 'Irrigation Technician'],
      },
      {
        id: 'agr_livestock',
        name: 'Livestock & Poultry',
        emoji: '🐄',
        subFocuses: ['Animal Health Monitoring', 'Feed Formulation & Management', 'Biosecurity Protocols', 'Breeding & Reproduction Records'],
        typicalRoles: ['Livestock Manager', 'Veterinary Technician', 'Farm Supervisor', 'Animal Nutritionist'],
      },
      {
        id: 'agr_processing',
        name: 'Food Processing & Packaging',
        emoji: '🏭',
        subFocuses: ['HACCP & Food Safety Plans', 'Processing Line Operations', 'Cold Storage & Temperature Control', 'Packaging & Labelling Compliance'],
        typicalRoles: ['Processing Operator', 'Food Safety Officer', 'QC Technician', 'Processing Supervisor'],
      },
      {
        id: 'agr_scm',
        name: 'Supply Chain & Exports',
        emoji: '🚛',
        subFocuses: ['Post-Harvest Handling & Grading', 'Export Documentation & Phytosanitary', 'Cold Chain Logistics', 'Market & Pricing Intelligence'],
        typicalRoles: ['Export Coordinator', 'Logistics Officer', 'Grader Supervisor', 'Supply Chain Manager'],
      },
    ],
  },

  // ── 9. Energy & Utilities ──────────────────────────────────────────────────
  {
    industry: 'Energy & Utilities',
    departments: [
      {
        id: 'eu_generation',
        name: 'Power Generation',
        emoji: '⚡',
        subFocuses: ['Plant Operations & Control Room', 'Turbine & Generator Maintenance', 'Fuel Management & Combustion', 'Generation Dispatch & Bidding'],
        typicalRoles: ['Plant Operator', 'Control Room Engineer', 'Turbine Technician', 'Generation Manager'],
      },
      {
        id: 'eu_grid',
        name: 'Transmission & Distribution',
        emoji: '🔌',
        subFocuses: ['Grid Stability & Load Dispatch', 'Substation Operations', 'Fault Detection & Line Repair', 'SCADA & EMS Operations'],
        typicalRoles: ['Load Dispatcher', 'Substation Technician', 'Grid Control Engineer', 'Line Crew Supervisor'],
      },
      {
        id: 'eu_renewable',
        name: 'Renewable Energy',
        emoji: '☀️',
        subFocuses: ['Solar PV O&M', 'Wind Farm Operations', 'Battery Storage Management', 'Renewable Performance Reporting'],
        typicalRoles: ['Solar Technician', 'Wind Technician', 'Renewable Energy Engineer', 'O&M Supervisor'],
      },
      {
        id: 'eu_customer',
        name: 'Customer Services & Metering',
        emoji: '📊',
        subFocuses: ['Smart Meter Installation & Reading', 'Billing Dispute Resolution', 'Connection Application Processing', 'Energy Efficiency Advisory'],
        typicalRoles: ['Meter Reader', 'Customer Service Agent', 'Connection Engineer', 'Billing Officer'],
      },
    ],
  },

  // ── 10. Logistics & Supply Chain ──────────────────────────────────────────
  {
    industry: 'Logistics & Supply Chain',
    departments: [
      {
        id: 'log_warehouse',
        name: 'Warehouse & Fulfilment',
        emoji: '🏪',
        subFocuses: ['Inbound Receiving & Put-Away', 'Pick, Pack & Ship Operations', 'Inventory Accuracy & Cycle Counts', 'WMS Operations & Slotting'],
        typicalRoles: ['Warehouse Operator', 'Picker', 'Team Leader', 'Warehouse Manager'],
      },
      {
        id: 'log_transport',
        name: 'Fleet & Transport',
        emoji: '🚚',
        subFocuses: ['Route Optimisation & Load Planning', 'Driver Compliance & Hours-of-Service', 'Fleet Maintenance & Telematics', 'POD & Last-Mile Tracking'],
        typicalRoles: ['Driver', 'Dispatcher', 'Fleet Supervisor', 'Transport Manager'],
      },
      {
        id: 'log_customs',
        name: 'Customs & Trade Compliance',
        emoji: '📋',
        subFocuses: ['Import/Export Documentation', 'Tariff Classification & Valuation', 'Customs Brokerage Operations', 'Trade Licence & Permit Management'],
        typicalRoles: ['Customs Broker', 'Trade Compliance Officer', 'Import/Export Coordinator', 'Freight Forwarder'],
      },
      {
        id: 'log_scm',
        name: 'Supply Chain Planning',
        emoji: '📈',
        subFocuses: ['S&OP Demand Forecasting', 'Purchase Order Management', 'Supplier Lead Time Management', 'Network Design & Optimisation'],
        typicalRoles: ['Supply Planner', 'Procurement Analyst', 'S&OP Manager', 'Supply Chain Director'],
      },
    ],
  },

  // ── 11. Insurance ─────────────────────────────────────────────────────────
  {
    industry: 'Insurance',
    departments: [
      {
        id: 'ins_underwriting',
        name: 'Underwriting',
        emoji: '📄',
        subFocuses: ['Risk Assessment & Pricing', 'Policy Wording & Terms', 'Facultative Reinsurance Placement', 'Portfolio Accumulation Control'],
        typicalRoles: ['Underwriter', 'Senior Underwriter', 'Risk Analyst', 'Underwriting Manager'],
      },
      {
        id: 'ins_claims',
        name: 'Claims',
        emoji: '📝',
        subFocuses: ['First Notice of Loss Processing', 'Claims Investigation & Reserve Setting', 'Subrogation & Recovery', 'Large Loss Management'],
        typicalRoles: ['Claims Handler', 'Loss Adjuster', 'Claims Investigator', 'Claims Manager'],
      },
      {
        id: 'ins_sales',
        name: 'Sales & Distribution',
        emoji: '🤝',
        subFocuses: ['Broker & Agent Relationship Management', 'Bancassurance Channel', 'Direct Sales & Telemarketing', 'Renewal Retention Campaigns'],
        typicalRoles: ['Sales Agent', 'Broker Relationship Manager', 'Account Executive', 'Sales Manager'],
      },
      {
        id: 'ins_actuarial',
        name: 'Actuarial & Analytics',
        emoji: '📊',
        subFocuses: ['Loss Reserving & IBNR', 'Pricing Model Development', 'Profitability & Portfolio Analysis', 'Regulatory Solvency Reporting'],
        typicalRoles: ['Actuarial Analyst', 'Actuary', 'Data Analyst', 'Chief Actuary'],
      },
    ],
  },

  // ── 12. Education ─────────────────────────────────────────────────────────
  {
    industry: 'Education',
    departments: [
      {
        id: 'edu_teaching',
        name: 'Teaching & Academic Affairs',
        emoji: '📚',
        subFocuses: ['Lesson Planning & Delivery', 'Student Assessment & Grading', 'Curriculum Mapping', 'Differentiated Learning Strategies'],
        typicalRoles: ['Teacher', 'Lecturer', 'Head of Department', 'Academic Coordinator'],
      },
      {
        id: 'edu_admissions',
        name: 'Admissions & Student Services',
        emoji: '🎓',
        subFocuses: ['Enrolment & Registration Processes', 'Scholarship & Financial Aid Administration', 'Student Orientation', 'Retention & At-Risk Student Support'],
        typicalRoles: ['Admissions Officer', 'Student Advisor', 'Registrar', 'Student Affairs Manager'],
      },
      {
        id: 'edu_operations',
        name: 'Operations & Facilities',
        emoji: '🏫',
        subFocuses: ['Timetabling & Room Scheduling', 'Campus Safety & Security', 'IT & E-Learning Infrastructure', 'Vendor & Supplier Management'],
        typicalRoles: ['Operations Coordinator', 'Facilities Supervisor', 'IT Support Technician', 'Operations Manager'],
      },
      {
        id: 'edu_research',
        name: 'Research & Development',
        emoji: '🔬',
        subFocuses: ['Grant Writing & Funding Applications', 'Research Ethics & Compliance', 'Publication & IP Management', 'Industry & Community Partnerships'],
        typicalRoles: ['Research Associate', 'Principal Investigator', 'Research Manager', 'Grants Administrator'],
      },
    ],
  },

  // ── 13. Technology & Software ─────────────────────────────────────────────
  {
    industry: 'Technology & Software',
    departments: [
      {
        id: 'tech_engineering',
        name: 'Software Engineering',
        emoji: '💻',
        subFocuses: ['Agile Sprint Planning & Delivery', 'Code Review & Technical Debt', 'CI/CD Pipeline Management', 'Microservices & API Design'],
        typicalRoles: ['Software Engineer', 'Backend Developer', 'Frontend Developer', 'Tech Lead', 'Engineering Manager'],
      },
      {
        id: 'tech_product',
        name: 'Product Management',
        emoji: '🗺',
        subFocuses: ['Product Roadmap & Prioritisation', 'User Story Writing & Backlog Grooming', 'Market & Competitor Analysis', 'OKR & Metrics Definition'],
        typicalRoles: ['Product Manager', 'Product Owner', 'VP of Product', 'Chief Product Officer'],
      },
      {
        id: 'tech_sales',
        name: 'Sales & Business Development',
        emoji: '🚀',
        subFocuses: ['SaaS Demo & Proof of Concept', 'Pipeline Forecasting & CRM', 'Enterprise Contract Negotiation', 'Partner & Reseller Management'],
        typicalRoles: ['Account Executive', 'SDR', 'Sales Manager', 'VP of Sales'],
      },
      {
        id: 'tech_security',
        name: 'Cybersecurity',
        emoji: '🔐',
        subFocuses: ['Threat Detection & SIEM', 'Vulnerability Assessment & Pen Testing', 'Security Incident Response', 'Zero Trust & IAM Architecture'],
        typicalRoles: ['Security Analyst', 'SOC Analyst', 'Penetration Tester', 'CISO'],
      },
      {
        id: 'tech_customer',
        name: 'Customer Success',
        emoji: '🎯',
        subFocuses: ['Onboarding & Implementation', 'Health Score Monitoring', 'Renewal & Upsell Management', 'Support Escalation Handling'],
        typicalRoles: ['Customer Success Manager', 'Implementation Specialist', 'Support Engineer', 'Head of Customer Success'],
      },
    ],
  },

  // ── 14. Pharmaceuticals & Biotech ─────────────────────────────────────────
  {
    industry: 'Pharmaceuticals & Biotech',
    departments: [
      {
        id: 'pharma_rd',
        name: 'R&D & Clinical',
        emoji: '🔬',
        subFocuses: ['Clinical Trial Protocol Design', 'Patient Recruitment & Site Management', 'Data Management & Biostatistics', 'Regulatory Submission Preparation'],
        typicalRoles: ['Clinical Research Associate', 'Medical Monitor', 'Biostatistician', 'R&D Director'],
      },
      {
        id: 'pharma_manufacturing',
        name: 'Manufacturing & GMP',
        emoji: '🏭',
        subFocuses: ['Batch Record & GMP Compliance', 'Cleanroom Operations', 'Process Validation', 'Deviations & CAPA Management'],
        typicalRoles: ['Manufacturing Operator', 'QA Officer', 'Process Engineer', 'Plant Manager'],
      },
      {
        id: 'pharma_regulatory',
        name: 'Regulatory Affairs',
        emoji: '📜',
        subFocuses: ['Dossier & CTD Preparation', 'Health Authority Interaction', 'Post-Approval Changes', 'Pharmacovigilance & ADR Reporting'],
        typicalRoles: ['Regulatory Affairs Specialist', 'Regulatory Manager', 'RA Director'],
      },
      {
        id: 'pharma_commercial',
        name: 'Commercial & Medical Sales',
        emoji: '💊',
        subFocuses: ['Key Opinion Leader Engagement', 'Detailing & Product Promotion', 'Market Access & Pricing Strategy', 'Sales Force Effectiveness'],
        typicalRoles: ['Medical Representative', 'Key Account Manager', 'Medical Science Liaison', 'Sales Director'],
      },
    ],
  },

  // ── 15. Hospitality & Tourism ─────────────────────────────────────────────
  {
    industry: 'Hospitality & Tourism',
    departments: [
      {
        id: 'hosp_frontoffice',
        name: 'Front Office & Reservations',
        emoji: '🛎',
        subFocuses: ['Check-In & Check-Out Procedures', 'Reservation Management & Upselling', 'Guest Complaint Handling', 'Night Audit & Reporting'],
        typicalRoles: ['Front Desk Agent', 'Reservations Agent', 'Duty Manager', 'Front Office Manager'],
      },
      {
        id: 'hosp_fb',
        name: 'Food & Beverage',
        emoji: '🍽',
        subFocuses: ['Restaurant Service Standards', 'Menu Engineering & Cost Control', 'Kitchen Operations & HACCP', 'Bar & Banquet Operations'],
        typicalRoles: ['Waiter', 'Chef de Partie', 'F&B Supervisor', 'Restaurant Manager'],
      },
      {
        id: 'hosp_housekeeping',
        name: 'Housekeeping',
        emoji: '🛏',
        subFocuses: ['Room Inspection Standards', 'Linen & Laundry Management', 'Cleaning Chemical Safety', 'Lost & Found Procedures'],
        typicalRoles: ['Room Attendant', 'Floor Supervisor', 'Housekeeping Manager', 'Public Area Attendant'],
      },
      {
        id: 'hosp_revenue',
        name: 'Revenue Management',
        emoji: '📊',
        subFocuses: ['Dynamic Pricing & Rate Strategy', 'Channel Management (OTA/Direct)', 'Forecasting & Pickup Analysis', 'Competitive Set Benchmarking'],
        typicalRoles: ['Revenue Analyst', 'Reservations Manager', 'Director of Revenue'],
      },
    ],
  },

  // ── 16. Mining & Metals ───────────────────────────────────────────────────
  {
    industry: 'Mining & Metals',
    departments: [
      {
        id: 'min_operations',
        name: 'Mine Operations',
        emoji: '⛏',
        subFocuses: ['Blast Design & Execution', 'Haul Truck & Loader Operations', 'Pit Slope Monitoring', 'Ore Feed Scheduling'],
        typicalRoles: ['Mine Operator', 'Blasting Engineer', 'Pit Supervisor', 'Mine Manager'],
      },
      {
        id: 'min_processing',
        name: 'Processing & Metallurgy',
        emoji: '🏭',
        subFocuses: ['Crushing & Grinding Operations', 'Flotation & Leaching Process Control', 'Metallurgical Balance & Recovery', 'Reagent Management'],
        typicalRoles: ['Plant Operator', 'Metallurgist', 'Process Engineer', 'Plant Manager'],
      },
      {
        id: 'min_safety',
        name: 'Safety & Occupational Health',
        emoji: '🦺',
        subFocuses: ['Surface & Underground Safety Inspections', 'Dust & Noise Exposure Monitoring', 'Emergency Evacuation Planning', 'Critical Risk Control Verification'],
        typicalRoles: ['Safety Officer', 'Occupational Hygienist', 'HSE Manager', 'Emergency Coordinator'],
      },
      {
        id: 'min_geology',
        name: 'Geology & Exploration',
        emoji: '🗺',
        subFocuses: ['Core Logging & Sample Management', 'Resource Estimation & Modelling', 'Exploration Drilling Programs', 'Geological Mapping'],
        typicalRoles: ['Geologist', 'Core Technician', 'Exploration Manager', 'Mine Geologist'],
      },
    ],
  },

  // ── 17. Media & Entertainment ─────────────────────────────────────────────
  {
    industry: 'Media & Entertainment',
    departments: [
      {
        id: 'med_content',
        name: 'Content Production',
        emoji: '🎬',
        subFocuses: ['Pre-Production Planning & Budgeting', 'Shoot & Location Management', 'Post-Production Workflow', 'Delivery & QC Standards'],
        typicalRoles: ['Producer', 'Director', 'Editor', 'Production Coordinator', 'DOP'],
      },
      {
        id: 'med_distribution',
        name: 'Distribution & Streaming',
        emoji: '📡',
        subFocuses: ['Platform Delivery & Encoding Standards', 'Rights Management & Windowing', 'Audience Analytics & Engagement', 'OTT Platform Operations'],
        typicalRoles: ['Distribution Manager', 'Rights Executive', 'Platform Operations Analyst'],
      },
      {
        id: 'med_sales',
        name: 'Advertising & Commercial',
        emoji: '📣',
        subFocuses: ['Advertising Inventory Management', 'Sponsorship & Brand Partnerships', 'Audience Targeting & Programmatic', 'Revenue Yield Optimisation'],
        typicalRoles: ['Ad Sales Executive', 'Sponsorship Manager', 'Commercial Director'],
      },
      {
        id: 'med_talent',
        name: 'Talent & IP Management',
        emoji: '🌟',
        subFocuses: ['Talent Contracting & Representation', 'IP Licensing & Royalty Management', 'Copyright Registration', 'Talent Development Programs'],
        typicalRoles: ['Talent Manager', 'IP Licensing Executive', 'Legal Counsel', 'Artist Relations Manager'],
      },
    ],
  },

  // ── 18. Automotive ────────────────────────────────────────────────────────
  {
    industry: 'Automotive',
    departments: [
      {
        id: 'auto_assembly',
        name: 'Manufacturing & Assembly',
        emoji: '🏭',
        subFocuses: ['Assembly Line Pacing & Takt Time', 'Torque & Fastener Management', 'Quality Gates & Station Audits', 'Andon & Escalation Systems'],
        typicalRoles: ['Assembly Operator', 'Line Leader', 'Quality Inspector', 'Production Supervisor'],
      },
      {
        id: 'auto_dealer',
        name: 'Dealer Network & Sales',
        emoji: '🚗',
        subFocuses: ['Vehicle Inventory & Floor Plan Management', 'Customer Test Drive & Sales Process', 'F&I (Finance & Insurance) Products', 'Dealer Performance Scorecard'],
        typicalRoles: ['Sales Consultant', 'Dealer Principal', 'Finance & Insurance Manager', 'Sales Manager'],
      },
      {
        id: 'auto_aftersales',
        name: 'Aftersales & Service',
        emoji: '🔧',
        subFocuses: ['Workshop Job Card & DMS Management', 'Warranty Claim Processing', 'Service Advisor Customer Handling', 'Parts Counter & Inventory'],
        typicalRoles: ['Service Advisor', 'Workshop Technician', 'Parts Manager', 'Service Manager'],
      },
      {
        id: 'auto_supplychain',
        name: 'Supply Chain & Procurement',
        emoji: '🔗',
        subFocuses: ['Supplier Quality & Delivery OTIF', 'Semiconductor & Long-Lead Part Planning', 'Just-In-Time Sequencing', 'Cost Reduction & VA/VE Programs'],
        typicalRoles: ['Supplier Quality Engineer', 'Materials Planner', 'Procurement Specialist', 'Supply Chain Manager'],
      },
    ],
  },

  // ── 19. Government & Public Sector ────────────────────────────────────────
  {
    industry: 'Government & Public Sector',
    departments: [
      {
        id: 'gov_policy',
        name: 'Policy & Legislation',
        emoji: '📜',
        subFocuses: ['Policy Research & Impact Assessment', 'Stakeholder Consultation', 'Legislative Drafting', 'Cabinet Submission Preparation'],
        typicalRoles: ['Policy Analyst', 'Legislative Advisor', 'Director of Policy', 'Ministerial Advisor'],
      },
      {
        id: 'gov_service',
        name: 'Public Services Delivery',
        emoji: '🏛',
        subFocuses: ['Citizen Request Processing', 'Service Level Agreement Monitoring', 'Queue & Case Management', 'Service Digitalisation'],
        typicalRoles: ['Civil Servant', 'Service Delivery Officer', 'Department Head', 'Director General'],
      },
      {
        id: 'gov_finance',
        name: 'Budget & Finance',
        emoji: '💰',
        subFocuses: ['Annual Budget Preparation', 'Public Expenditure Monitoring', 'Treasury & Debt Management', 'Audit & Internal Control'],
        typicalRoles: ['Budget Analyst', 'Treasury Officer', 'Finance Controller', 'Auditor General'],
      },
      {
        id: 'gov_infrastructure',
        name: 'Infrastructure & Projects',
        emoji: '🏗',
        subFocuses: ['Public Works Tendering & Procurement', 'Project Oversight & Progress Reporting', 'Community & Stakeholder Engagement', 'Environmental & Social Safeguards'],
        typicalRoles: ['Project Engineer', 'Infrastructure Planner', 'Procurement Officer', 'Programme Manager'],
      },
    ],
  },

  // ── 20. Aviation & Aerospace ──────────────────────────────────────────────
  {
    industry: 'Aviation & Aerospace',
    departments: [
      {
        id: 'avi_flight',
        name: 'Flight Operations',
        emoji: '✈️',
        subFocuses: ['Pre-Flight Planning & Briefing', 'CRM & Crew Coordination', 'Adverse Weather Decision-Making', 'Post-Flight Debriefing & Reports'],
        typicalRoles: ['First Officer', 'Captain', 'Flight Dispatcher', 'Chief Pilot'],
      },
      {
        id: 'avi_mro',
        name: 'Maintenance, Repair & Overhaul (MRO)',
        emoji: '🔧',
        subFocuses: ['Line Maintenance & Technical Logging', 'Component Removal & Installation', 'Airworthiness Directives Compliance', 'NDT & Structural Inspection'],
        typicalRoles: ['Aircraft Maintenance Engineer', 'Avionics Technician', 'Quality Inspector', 'MRO Manager'],
      },
      {
        id: 'avi_groundops',
        name: 'Ground Operations & Ramp',
        emoji: '🛄',
        subFocuses: ['Aircraft Turnaround Coordination', 'Baggage Handling & Loading Supervision', 'Fuelling & De-icing Operations', 'FOD Prevention & Ramp Safety'],
        typicalRoles: ['Ramp Agent', 'Ground Handling Supervisor', 'Fueller', 'Station Manager'],
      },
      {
        id: 'avi_commercial',
        name: 'Commercial & Revenue',
        emoji: '📊',
        subFocuses: ['Network Planning & Slot Management', 'Fare Filing & Pricing Strategy', 'GDS & NDC Distribution', 'Alliance & Codeshare Management'],
        typicalRoles: ['Revenue Analyst', 'Network Planner', 'Pricing Analyst', 'Commercial Director'],
      },
    ],
  },

  // ── 21. Distribution Company ──────────────────────────────────────────────
  {
    industry: 'Distribution Company',
    departments: [
      {
        id: 'dist_sales',
        name: 'Sales & Territory Management',
        emoji: '🤝',
        subFocuses: [
          'Territory Planning & Route Coverage',
          'Customer Order Taking & Upselling',
          'Sales Target Setting & Daily Tracking',
          'Outlet Classification & Call Frequency',
          'Promotional Sell-In & Activation',
        ],
        typicalRoles: ['Sales Representative', 'Area Sales Manager', 'Key Account Executive', 'Van Salesman', 'Regional Sales Manager'],
      },
      {
        id: 'dist_warehouse',
        name: 'Warehouse & Inventory',
        emoji: '🏪',
        subFocuses: [
          'Goods Receiving & Inspection (GRN)',
          'Bin Location & Stock Slotting',
          'Pick, Pack & Dispatch Operations',
          'FIFO / FEFO Rotation & Expiry Management',
          'Cycle Counting & Stock Reconciliation',
        ],
        typicalRoles: ['Warehouse Supervisor', 'Store Keeper', 'Inventory Controller', 'Picker & Packer', 'Warehouse Manager'],
      },
      {
        id: 'dist_delivery',
        name: 'Fleet & Delivery Operations',
        emoji: '🚚',
        subFocuses: [
          'Delivery Route Planning & Optimisation',
          'Driver Manifest & POD Management',
          'Vehicle Inspection & Maintenance Scheduling',
          'Failed Delivery & Returns Handling',
          'Cold Chain Compliance (where applicable)',
        ],
        typicalRoles: ['Driver', 'Delivery Supervisor', 'Fleet Coordinator', 'Logistics Manager', 'Transport Manager'],
      },
      {
        id: 'dist_commercial',
        name: 'Commercial & Principal Relations',
        emoji: '📋',
        subFocuses: [
          'Principal / Brand Owner Relationship Management',
          'Distribution Agreement & Target Negotiation',
          'Trade Terms & Pricing Management',
          'Market Share & Sellout Reporting to Principals',
          'New Principal & Category Onboarding',
        ],
        typicalRoles: ['Commercial Manager', 'Business Development Manager', 'Principal Relations Executive', 'Category Manager', 'Trade Marketing Manager'],
      },
      {
        id: 'dist_credit',
        name: 'Credit Control & Finance',
        emoji: '💰',
        subFocuses: [
          'Customer Credit Limit Setting & Review',
          'Accounts Receivable & Aging Follow-Up',
          'Collection Calls & Field Collections',
          'Bad Debt Provisioning & Write-Off Process',
          'Cash & Cheque Handling Compliance',
        ],
        typicalRoles: ['Credit Controller', 'Collections Officer', 'Finance Manager', 'Accounts Receivable Clerk', 'CFO'],
      },
      {
        id: 'dist_procurement',
        name: 'Procurement & Supplier Management',
        emoji: '🔗',
        subFocuses: [
          'Purchase Order Management & Lead Time Tracking',
          'Supplier Performance & On-Time Delivery',
          'Demand Forecasting & Replenishment Planning',
          'Import Customs & Clearance Coordination',
          'Cost Negotiation & Landed Cost Analysis',
        ],
        typicalRoles: ['Purchasing Officer', 'Procurement Manager', 'Supply Planner', 'Demand Planner', 'Procurement Director'],
      },
    ],
  },
];
