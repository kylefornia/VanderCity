"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import resumeData from "./resume.json";

export interface JobExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  technologies: string[];
  achievements?: string[];
  logo?: string;
  coverPhoto?: string;
  buildingPosition: [number, number, number];
  buildingColor: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  duration: string;
  graduationDate: string;
  location: string;
  description: string;
  achievements?: string[];
  buildingPosition: [number, number, number];
  buildingColor: string;
}

export interface Interest {
  id: string;
  name: string;
  category: "sports" | "hobby" | "other";
  description: string;
  details?: string[];
  buildingPosition: [number, number, number];
  buildingColor: string;
}

export interface PersonalProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  screenshots?: string[];
  featured?: boolean;
  buildingPosition: [number, number, number];
  buildingColor: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
  skills: string[];
  experiences: JobExperience[];
  education: Education[];
  interests: Interest[];
  personalProjects: PersonalProject[];
}

// Grid constants
const BLOCK_SIZE = 20;
const STREET_WIDTH = 4;
const GRID_SIZE = 5;

// Helper function to convert grid coordinates to world position
const gridToWorldPosition = (
  row: number,
  col: number
): [number, number, number] => {
  const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
  const startPos = -totalSize / 2;

  const x =
    startPos +
    col * (BLOCK_SIZE + STREET_WIDTH) +
    STREET_WIDTH +
    BLOCK_SIZE / 2;
  const z =
    startPos +
    row * (BLOCK_SIZE + STREET_WIDTH) +
    STREET_WIDTH +
    BLOCK_SIZE / 2;
  return [x, 0, z];
};

// Helper function to convert world position to grid coordinates
const worldToGridPosition = (
  position: [number, number, number]
): [number, number] | null => {
  const [x, , z] = position;
  const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
  const startPos = -totalSize / 2;

  const col = Math.round(
    (x - startPos - STREET_WIDTH - BLOCK_SIZE / 2) / (BLOCK_SIZE + STREET_WIDTH)
  );
  const row = Math.round(
    (z - startPos - STREET_WIDTH - BLOCK_SIZE / 2) / (BLOCK_SIZE + STREET_WIDTH)
  );

  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    return [row, col];
  }
  return null;
};

// Helper function to generate work experience positions in a ring around center
const generateWorkPosition = (index: number): [number, number, number] => {

  // Ring positions around center (2,2)
  // First ring: positions adjacent to center
  const ringPositions: Array<[number, number]> = [
    [1, 1],
    [1, 2],
    [1, 3], // Top row
    [2, 1],
    [2, 3], // Middle row (skip center)
    [3, 1],
    [3, 2],
    [3, 3], // Bottom row
  ];

  // If we have more work experiences, add second ring
  const secondRingPositions: Array<[number, number]> = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4], // Top row
    [1, 0],
    [1, 4], // Left and right
    [2, 0],
    [2, 4], // Left and right
    [3, 0],
    [3, 4], // Left and right
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4], // Bottom row
  ];

  const allPositions = [...ringPositions, ...secondRingPositions];
  const position = allPositions[index % allPositions.length];
  return gridToWorldPosition(position[0], position[1]);
};

// Helper function to generate spiral positions
// Creates a true spiral pattern starting from outside corners and spiraling inward
// Excludes positions occupied by work experience buildings (ring around center)
// Can be used for both personal projects and education (with offset)
const generateSpiralPosition = (
  index: number,
  offset: number = 0
): [number, number, number] => {

  // Work experience positions (ring around center) - these should be excluded
  const workPositions = new Set([
    "1,1",
    "1,2",
    "1,3", // Top row of ring
    "2,1",
    "2,3", // Middle row (skip center)
    "3,1",
    "3,2",
    "3,3", // Bottom row of ring
  ]);

  // True spiral pattern: start at top-left corner, go clockwise around the perimeter
  // then move inward and repeat. This creates a visually pleasing spiral layout.
  // Filter out positions that are in the work ring
  const allSpiralPositions: Array<[number, number]> = [
    // Outer ring - clockwise spiral starting from top-left
    [0, 0], // Top-left corner
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4], // Top edge
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4], // Right edge
    [4, 3],
    [4, 2],
    [4, 1],
    [4, 0], // Bottom edge
    [3, 0],
    [2, 0],
    [1, 0], // Left edge (back to start)
    // Inner ring - clockwise spiral (excluding center and work positions)
    [1, 1],
    [1, 2],
    [1, 3], // Top
    [2, 3],
    [3, 3], // Right
    [3, 2],
    [3, 1], // Bottom
    [2, 1], // Left (completing inner ring)
  ];

  // Filter out work positions from spiral
  const spiralOrder = allSpiralPositions.filter(
    (pos) => !workPositions.has(`${pos[0]},${pos[1]}`)
  );

  const position = spiralOrder[(index + offset) % spiralOrder.length];
  return gridToWorldPosition(position[0], position[1]);
};

// Helper function to generate building positions for education and interests
// Uses remaining positions after work and projects are placed
// Unused function - kept for reference
/*
const _generateBuildingPosition = (
  _index: number,
  _total: number,
  _offset: number = 0
): [number, number, number] => {
  const CENTER_ROW = 2;
  const CENTER_COL = 2;

  // Get all positions excluding center park
  const allPositions: Array<[number, number]> = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      // Skip center park
      if (row === CENTER_ROW && col === CENTER_COL) continue;
      allPositions.push([row, col]);
    }
  }

  const idx = (_index + _offset) % allPositions.length;
  const position = allPositions[idx];
  return gridToWorldPosition(position[0], position[1]);
};
*/

// Helper function to find the first available position for home
// This matches the logic in Buildings.tsx where home is placed at first available spot
const findHomePosition = (
  occupiedPositions: Set<string>
): [number, number] | null => {
  const parkPositions = new Set(["2,2"]);

  // Find first available position (same order as Buildings.tsx loop)
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const gridKey = `${row},${col}`;
      // Skip if occupied or is a park
      if (occupiedPositions.has(gridKey) || parkPositions.has(gridKey)) {
        continue;
      }
      return [row, col];
    }
  }
  return null;
};

// Helper function to generate interest positions
// Excludes positions occupied by work, education, projects, and home
// Only uses available small building spots (low priority)
const generateInterestPosition = (
  index: number,
  occupiedPositions: Set<string>
): [number, number, number] => {
  const CENTER_ROW = 2;
  const CENTER_COL = 2;

  // Reserve home position (first available spot)
  const homePosition = findHomePosition(occupiedPositions);
  const positionsWithHome = new Set(occupiedPositions);
  if (homePosition) {
    positionsWithHome.add(`${homePosition[0]},${homePosition[1]}`);
  }

  // Get all available positions (excluding center park, occupied positions, and home)
  const availablePositions: Array<[number, number]> = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const positionKey = `${row},${col}`;
      // Skip center park, occupied positions, and home position
      if (
        (row === CENTER_ROW && col === CENTER_COL) ||
        positionsWithHome.has(positionKey)
      ) {
        continue;
      }
      availablePositions.push([row, col]);
    }
  }

  // If no available positions, fallback to any non-center position (excluding home)
  if (availablePositions.length === 0) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const positionKey = `${row},${col}`;
        if (
          (row !== CENTER_ROW || col !== CENTER_COL) &&
          !positionsWithHome.has(positionKey)
        ) {
          availablePositions.push([row, col]);
        }
      }
    }
  }

  const idx = index % availablePositions.length;
  const position = availablePositions[idx];
  return gridToWorldPosition(position[0], position[1]);
};

// Helper function to generate diverse, vibrant colors for each building
const generateColor = (
  index: number,
  type: "work" | "education" | "interest" | "project"
): string => {
  // Diverse, vibrant color palettes - each building gets a unique color
  const workColors = [
    "#4A90E2", // Vibrant blue
    "#50C878", // Emerald green
    "#FF6B6B", // Coral red
    "#9B59B6", // Purple
    "#3498DB", // Sky blue
    "#2ECC71", // Green
    "#E74C3C", // Red
    "#F39C12", // Orange
    "#1ABC9C", // Turquoise
    "#E67E22", // Dark orange
    "#34495E", // Dark blue-gray
    "#16A085", // Teal
  ];
  const educationColors = [
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#673AB7", // Deep purple
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#00BCD4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#8BC34A", // Light green
    "#FFC107", // Amber
    "#FF9800", // Orange
    "#FF5722", // Deep orange
  ];
  const interestColors = [
    "#FF1744", // Red
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#673AB7", // Deep purple
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#00BCD4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#8BC34A", // Light green
    "#CDDC39", // Lime
    "#FFEB3B", // Yellow
    "#FFC107", // Amber
    "#FF9800", // Orange
    "#FF5722", // Deep orange
    "#795548", // Brown
  ];

  const projectColors = [
    "#FF6B6B", // Coral red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky blue
    "#FFA07A", // Light salmon
    "#98D8C8", // Mint green
    "#F7DC6F", // Yellow
    "#BB8FCE", // Light purple
    "#85C1E2", // Light blue
    "#F8B739", // Orange
    "#52BE80", // Green
    "#EC7063", // Red
    "#5DADE2", // Blue
    "#F4D03F", // Gold
    "#AF7AC5", // Purple
    "#48C9B0", // Teal
    "#F39C12", // Orange
  ];

  if (type === "work") return workColors[index % workColors.length];
  if (type === "education")
    return educationColors[index % educationColors.length];
  if (type === "project") return projectColors[index % projectColors.length];
  return interestColors[index % interestColors.length];
};

// Transform resume.json data to ResumeData format
const transformResumeData = (): ResumeData => {
  // Extract skills from all categories
  const allSkills = [
    ...resumeData.skills.strong.map((s) => s.name),
    ...resumeData.skills.experienced.map((s) => s.name),
    ...resumeData.skills.specialized.map((s) => s.name),
  ];

  // Transform experiences - place in ring around center park
  const experiences: JobExperience[] = resumeData.experience.map(
    (exp, index) => ({
      id: `exp-${index + 1}`,
      company: exp.company,
      position: exp.title,
      duration: `${exp.startDate} - ${exp.endDate}`,
      startDate: exp.startDate,
      endDate: exp.endDate,
      location: exp.location,
      description: exp.description,
      technologies: exp.technologies || [],
      achievements: exp.achievements || [],
      logo: exp.logo,
      coverPhoto: exp.coverPhoto,
      buildingPosition: generateWorkPosition(index),
      buildingColor: generateColor(index, "work"),
    })
  );

  // Transform education - handle optional education field
  const education: Education[] = ((resumeData as any).education || []).map((edu: any, index: number) => {
    // Assign specific colors: first school = white/green, second = red
    let buildingColor: string;
    if (index === 0) {
      buildingColor = "#FFFFFF"; // White (will be used with green accents)
    } else {
      buildingColor = "#E74C3C"; // Red
    }

    return {
      id: `edu-${index + 1}`,
      school: edu.institution,
      degree: edu.degree,
      field: edu.degree.split(" - ")[1] || "",
      duration: `Graduated ${edu.graduationDate}`,
      graduationDate: edu.graduationDate,
      location: edu.location,
      description: `Studied ${
        edu.relevantCoursework?.join(", ") || "various subjects"
      } at ${edu.institution} in ${edu.location}.`,
      achievements: [],
      buildingPosition: generateSpiralPosition(
        index,
        (resumeData.projects || []).length // Continue spiral after personal projects
      ),
      buildingColor: buildingColor,
    };
  });

  // Transform personal projects - place in spiral pattern
  const personalProjects: PersonalProject[] = resumeData.projects.map(
    (project, index) => ({
      id: `project-${index + 1}`,
      name: project.name,
      description: project.description,
      technologies: project.technologies || [],
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      image: project.image,
      screenshots: project.screenshots || undefined,
      featured: project.featured,
      buildingPosition: generateSpiralPosition(index),
      buildingColor: generateColor(index, "project"),
    })
  );

  // Calculate occupied positions from work, education, and projects
  const occupiedPositions = new Set<string>();

  // Add work positions
  resumeData.experience.forEach((_, index) => {
    const position = generateWorkPosition(index);
    const gridPos = worldToGridPosition(position);
    if (gridPos) {
      occupiedPositions.add(`${gridPos[0]},${gridPos[1]}`);
    }
  });

  // Add education positions
  ((resumeData as any).education || []).forEach((_: any, index: number) => {
    const position = generateSpiralPosition(index, (resumeData.projects || []).length);
    const gridPos = worldToGridPosition(position);
    if (gridPos) {
      occupiedPositions.add(`${gridPos[0]},${gridPos[1]}`);
    }
  });

  // Add project positions
  resumeData.projects.forEach((_, index) => {
    const position = generateSpiralPosition(index);
    const gridPos = worldToGridPosition(position);
    if (gridPos) {
      occupiedPositions.add(`${gridPos[0]},${gridPos[1]}`);
    }
  });

  // Transform interests - categorize them
  const categorizeInterest = (
    interest: string
  ): "sports" | "hobby" | "other" => {
    const lower = interest.toLowerCase();
    if (
      lower.includes("sport") ||
      lower.includes("basketball") ||
      lower.includes("fitness")
    ) {
      return "sports";
    }
    if (
      lower.includes("hackathon") ||
      lower.includes("community") ||
      lower.includes("learning") ||
      lower.includes("innovation")
    ) {
      return "hobby";
    }
    return "other";
  };

  // Transform interests - all positioned in available small building spots
  const interests: Interest[] = resumeData.interests.map((interest, index) => ({
    id: `int-${index + 1}`,
    name: interest,
    category: categorizeInterest(interest),
    description: `Passionate about ${interest.toLowerCase()}.`,
    details: [],
    buildingPosition: generateInterestPosition(index, occupiedPositions),
    buildingColor: generateColor(index, "interest"),
  }));

  return {
    name: resumeData.personal.name,
    title: resumeData.personal.title,
    email: resumeData.personal.email,
    phone: resumeData.personal.phone,
    location: resumeData.personal.location,
    linkedin: resumeData.personal.linkedin,
    github: resumeData.personal.github,
    website: resumeData.personal.website,
    summary: resumeData.personal.summary,
    skills: allSkills,
    experiences,
    education,
    interests,
    personalProjects,
  };
};


export type BuildingCategory = "work" | "education" | "interest" | "project";

export interface SelectedBuilding {
  id: string;
  category: BuildingCategory;
}

interface ResumeContextType {
  resume: ResumeData;
  selectedBuilding: SelectedBuilding | null;
  setSelectedBuilding: (building: SelectedBuilding | null) => void;
  updateResume: () => void;
  zoomToBuilding?: (category: BuildingCategory, id: string) => void;
  isLeftPanelVisible: boolean;
  setIsLeftPanelVisible: (visible: boolean) => void;
  isScreenshotModalOpen: boolean;
  setIsScreenshotModalOpen: (open: boolean) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({
  children,
  zoomToPosition,
}: {
  children: ReactNode;
  zoomToPosition?: (
    position: [number, number, number],
    distance?: number,
    targetHeight?: number
  ) => void;
}) => {
  const resume = useMemo(() => transformResumeData(), []);
  const [selectedBuilding, setSelectedBuilding] =
    useState<SelectedBuilding | null>(null);
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

  const updateResume = () => {
    // Note: Since we're using static data from JSON, updates won't persist
    // This is kept for API compatibility
    console.warn(
      "updateResume called but resume data is loaded from JSON file"
    );
  };

  const zoomToBuilding = (category: BuildingCategory, id: string) => {
    if (!zoomToPosition) return;

    let buildingPosition: [number, number, number] | null = null;
    let targetHeight: number | undefined = undefined;

    if (category === "work") {
      const exp = resume.experiences.find((e) => e.id === id);
      if (exp) {
        buildingPosition = exp.buildingPosition;
        // Work buildings are tall (24-30 units) with tooltips on top
        // Set target height to middle/upper portion of building to show tooltip
        targetHeight = 20; // Approximately middle of tall work buildings
      }
    } else if (category === "education") {
      const edu = resume.education.find((e) => e.id === id);
      if (edu) buildingPosition = edu.buildingPosition;
    } else if (category === "interest") {
      const int = resume.interests.find((i) => i.id === id);
      if (int) {
        // Basketball interest should zoom to center court (2,2)
        if (int.name.toLowerCase() === "basketball") {
          buildingPosition = gridToWorldPosition(2, 2);
        } else {
          buildingPosition = int.buildingPosition;
        }
      }
    } else if (category === "project") {
      const proj = resume.personalProjects.find((p) => p.id === id);
      if (proj) buildingPosition = proj.buildingPosition;
    }

    if (buildingPosition) {
      zoomToPosition(buildingPosition, 100, targetHeight);
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        resume,
        selectedBuilding,
        setSelectedBuilding,
        updateResume,
        zoomToBuilding,
        isLeftPanelVisible,
        setIsLeftPanelVisible,
        isScreenshotModalOpen,
        setIsScreenshotModalOpen,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
};
