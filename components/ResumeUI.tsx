import type {
  Education,
  Interest,
  JobExperience,
  PersonalProject,
} from "@/context/ResumeContext";
import {
  FaBasketballBall,
  FaGithub,
  FaLightbulb,
  FaLinkedin,
  FaPalette,
} from "react-icons/fa";
import {
  IoArrowBackOutline,
  IoBriefcaseOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronUpOutline,
  IoCloseOutline,
  IoCodeSlashOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoMailOutline,
  IoMenuOutline,
  IoSchoolOutline,
  IoSearchOutline,
  IoStarOutline,
} from "react-icons/io5";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useResume } from "@/context/ResumeContext";

// Memoized list item components to prevent unnecessary re-renders
interface ExperienceListItemProps {
  exp: JobExperience;
  isSelected: boolean;
  onSelect: (category: "work", id: string) => void;
}

const ExperienceListItem = memo(
  ({ exp, isSelected, onSelect }: ExperienceListItemProps) => {
    const handleClick = useCallback(() => {
      onSelect("work", exp.id);
    }, [onSelect, exp.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect("work", exp.id);
        }
      },
      [onSelect, exp.id]
    );

    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`w-full text-left bg-white rounded-lg border transition-all duration-200 ${
          isSelected
            ? "border-blue-500 shadow-md bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
        tabIndex={0}
        aria-label={`View ${exp.company} experience`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex-shrink-0">
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <IoBriefcaseOutline
                  className={`w-4 h-4 ${
                    isSelected ? "text-blue-600" : "text-gray-600"
                  }`}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 leading-tight">
                {exp.company}
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {exp.position}
              </p>
              <div className="flex flex-row items-center gap-2 mt-2 w-full overflow-hidden">
                <p className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                  {exp.duration}
                </p>
                {exp.location && (
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                    <IoLocationOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600 truncate whitespace-nowrap">
                      {exp.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
);
ExperienceListItem.displayName = "ExperienceListItem";

interface EducationListItemProps {
  edu: Education;
  isSelected: boolean;
  onSelect: (category: "education", id: string) => void;
}

const EducationListItem = memo(
  ({ edu, isSelected, onSelect }: EducationListItemProps) => {
    const handleClick = useCallback(() => {
      onSelect("education", edu.id);
    }, [onSelect, edu.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect("education", edu.id);
        }
      },
      [onSelect, edu.id]
    );

    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`w-full text-left bg-white rounded-lg border transition-all duration-200 ${
          isSelected
            ? "border-green-500 shadow-md bg-green-50"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
        tabIndex={0}
        aria-label={`View ${edu.school} education`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex-shrink-0">
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <IoSchoolOutline
                  className={`w-4 h-4 ${
                    isSelected ? "text-green-600" : "text-gray-600"
                  }`}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 leading-tight">
                {edu.school}
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {edu.degree}
              </p>
              <div className="flex flex-row items-center gap-2 mt-2 w-full overflow-hidden">
                <p className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                  {edu.duration}
                </p>
                {edu.location && (
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                    <IoLocationOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600 truncate whitespace-nowrap">
                      {edu.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }
);
EducationListItem.displayName = "EducationListItem";

interface ProjectListItemProps {
  proj: PersonalProject;
  isSelected: boolean;
  onSelect: (category: "project", id: string) => void;
}

const ProjectListItem = memo(
  ({ proj, isSelected, onSelect }: ProjectListItemProps) => {
    const handleClick = useCallback(() => {
      onSelect("project", proj.id);
    }, [onSelect, proj.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect("project", proj.id);
        }
      },
      [onSelect, proj.id]
    );

    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`w-full text-left bg-white rounded-lg border transition-all duration-200 ${
          isSelected
            ? "border-purple-500 shadow-md bg-purple-50"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
        tabIndex={0}
        aria-label={`View ${proj.name} project`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex-shrink-0">
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? "bg-purple-100" : "bg-gray-100"
                }`}
              >
                <IoCodeSlashOutline
                  className={`w-4 h-4 ${
                    isSelected ? "text-purple-600" : "text-gray-600"
                  }`}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 leading-tight">
                {proj.name}
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                {proj.description}
              </p>
              {proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proj.technologies.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.technologies.length > 3 && (
                    <span className="text-xs px-2 py-1 text-gray-400">
                      +{proj.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }
);
ProjectListItem.displayName = "ProjectListItem";

interface InterestListItemProps {
  int: Interest;
  isSelected: boolean;
  onSelect: (category: "interest", id: string) => void;
  getInterestCategoryIcon: (category: string) => JSX.Element;
}

const InterestListItem = memo(
  ({
    int,
    isSelected,
    onSelect,
    getInterestCategoryIcon,
  }: InterestListItemProps) => {
    const handleClick = useCallback(() => {
      onSelect("interest", int.id);
    }, [onSelect, int.id]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect("interest", int.id);
        }
      },
      [onSelect, int.id]
    );

    const isSports = int.category === "sports";
    const isHobby = int.category === "hobby";

    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`w-full text-left bg-white rounded-lg border transition-all duration-200 ${
          isSelected
            ? isSports
              ? "border-red-500 shadow-md bg-red-50"
              : isHobby
              ? "border-teal-500 shadow-md bg-teal-50"
              : "border-orange-500 shadow-md bg-orange-50"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
        tabIndex={0}
        aria-label={`View ${int.name} interest`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex-shrink-0">
              <div
                className={`p-2 rounded-lg ${
                  isSelected
                    ? isSports
                      ? "bg-red-100"
                      : isHobby
                      ? "bg-teal-100"
                      : "bg-orange-100"
                    : "bg-gray-100"
                }`}
              >
                <div
                  className={`${
                    isSelected
                      ? isSports
                        ? "text-red-600"
                        : isHobby
                        ? "text-teal-600"
                        : "text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {getInterestCategoryIcon(int.category)}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 leading-tight">
                {int.name}
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                {int.description}
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  }
);
InterestListItem.displayName = "InterestListItem";

// Type guard helper
const isBuildingSelected = (
  building: { category: string; id: string } | null,
  category: string,
  id: string
): boolean => {
  return (
    building !== null && building.category === category && building.id === id
  );
};

const ResumeUI = () => {
  const {
    resume,
    selectedBuilding,
    setSelectedBuilding,
    isLeftPanelVisible,
    setIsLeftPanelVisible,
    isScreenshotModalOpen,
    setIsScreenshotModalOpen,
    zoomToBuilding,
    zoomToHome,
    isSkillsPageOpen,
    setIsSkillsPageOpen,
    skills,
  } = useResume();
  const [searchQuery, setSearchQuery] = useState("");
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);
  const [sheetState, setSheetState] = useState<
    "collapsed" | "half" | "expanded"
  >("half");
  const [sheetDragY, setSheetDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartState = useRef<"collapsed" | "half" | "expanded">("half");
  const currentDragY = useRef(0); // Use ref to track current drag distance
  const headerRef = useRef<HTMLDivElement>(null);
  const detailViewRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const selectedExperience =
    selectedBuilding?.category === "work" && resume
      ? resume.experiences.find((exp) => exp.id === selectedBuilding.id)
      : null;

  const selectedEducation =
    selectedBuilding?.category === "education" && resume
      ? resume.education.find((edu) => edu.id === selectedBuilding.id)
      : null;

  const selectedInterest =
    selectedBuilding?.category === "interest" && resume
      ? resume.interests.find((int) => int.id === selectedBuilding.id)
      : null;

  const selectedProject =
    selectedBuilding?.category === "project" && resume
      ? resume.personalProjects.find((proj) => proj.id === selectedBuilding.id)
      : null;

  // Memoize whether to show profile section to prevent flickering
  // Check resume availability directly - resume should always be available from context
  const showProfileSection = useMemo(() => {
    // Ensure resume exists and has required data
    if (!resume || !resume.name || resume.name.trim() === "") {
      return false;
    }

    // Only show when no building is selected and skills page is not open
    return selectedBuilding === null && !isSkillsPageOpen;
  }, [selectedBuilding, resume, isSkillsPageOpen]);

  // Scroll sheet to top on mobile when profile section becomes visible
  // This fixes the issue where content is in DOM but not visible after closing tooltip
  useEffect(() => {
    if (showProfileSection && isMobile && sheetRef.current) {
      const sheet = sheetRef.current;
      // Scroll to top to ensure profile section (at top of sheet) is visible
      if (sheet.scrollTop > 0) {
        sheet.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [showProfileSection, isMobile]);

  const handleBackToList = () => {
    setSelectedBuilding(null);
    setIsSkillsPageOpen(false);
    // Don't close the sheet when going back to list
  };

  const handleToggleLeftPanel = () => {
    setIsLeftPanelVisible(!isLeftPanelVisible);
    // Reset to half screen when opening
    if (!isLeftPanelVisible) {
      setSheetState("half");
    }
  };

  const handleToggleSheetExpanded = () => {
    // Cycle through states: half -> expanded -> half
    if (sheetState === "half") {
      setSheetState("expanded");
    } else if (sheetState === "expanded") {
      setSheetState("half");
    } else {
      setSheetState("half");
    }
  };

  const handleSheetDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isMobile) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    dragStartState.current = sheetState;
    currentDragY.current = 0;
    setSheetDragY(0);
  };

  const handleSheetDragEnd = useCallback(() => {
    if (!isMobile || !isDragging) return;

    // Use ref to get the most current drag distance (state might be stale)
    const dragDistance = currentDragY.current;
    const currentState = dragStartState.current;

    const viewportHeight = window.innerHeight;
    const navBarHeight = 64;
    const maxHeight = viewportHeight - navBarHeight;
    const halfHeight = viewportHeight * 0.5;
    const collapsedHeight = 120; // Peek height

    // Calculate current height during drag
    let baseHeight: number;
    if (currentState === "expanded") {
      baseHeight = maxHeight;
    } else if (currentState === "half") {
      baseHeight = halfHeight;
    } else {
      baseHeight = collapsedHeight;
    }

    const currentHeight = Math.max(
      collapsedHeight,
      Math.min(maxHeight, baseHeight - dragDistance)
    );

    // Determine which state to snap to based on current height
    // Use thresholds: collapsed < 200px, half < 70% of screen, expanded >= 70%
    const threshold1 = 200; // Between collapsed and half
    const threshold2 = viewportHeight * 0.7; // Between half and expanded

    let newState: "collapsed" | "half" | "expanded";

    if (currentHeight < threshold1) {
      newState = "collapsed";
    } else if (currentHeight < threshold2) {
      newState = "half";
    } else {
      newState = "expanded";
    }

    // Also consider drag direction for better UX
    if (dragDistance < -30) {
      // Swiping up - move to next higher state
      if (currentState === "collapsed") newState = "half";
      else if (currentState === "half") newState = "expanded";
    } else if (dragDistance > 30) {
      // Swiping down - move to next lower state
      if (currentState === "expanded") newState = "half";
      else if (currentState === "half") newState = "collapsed";
    }

    // Reset dragging state first
    setIsDragging(false);
    setSheetDragY(0);
    currentDragY.current = 0;

    // Set the new state
    setSheetState(newState);
  }, [isMobile, isDragging]);

  // Add global mouse/touch listeners for dragging
  useEffect(() => {
    if (!isMobile || !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaY = e.clientY - dragStartY.current;
      currentDragY.current = deltaY;
      setSheetDragY(deltaY);
    };

    const handleMouseUp = () => {
      handleSheetDragEnd();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const deltaY = e.touches[0].clientY - dragStartY.current;
      currentDragY.current = deltaY;
      setSheetDragY(deltaY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSheetDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, isDragging, sheetDragY, handleSheetDragEnd]);

  const handleKeyDownToggle = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleLeftPanel();
    }
  };

  const getInterestCategoryIcon = useCallback((category: string) => {
    if (category === "sports") {
      return <FaBasketballBall className="w-3 h-3 text-gray-500" />;
    }
    if (category === "hobby") {
      return <FaPalette className="w-3 h-3 text-gray-500" />;
    }
    return <FaLightbulb className="w-3 h-3 text-gray-500" />;
  }, []);

  const handleSelectBuilding = useCallback(
    (category: "work" | "education" | "interest" | "project", id: string) => {
      // Ensure we're setting the building correctly
      if (id && category) {
        setSelectedBuilding({ category, id });
        // Auto-zoom on desktop, but not on mobile - let mobile users choose to view on map
        if (!isMobile && zoomToBuilding) {
          zoomToBuilding(category, id);
        }
      }
    },
    [setSelectedBuilding, isMobile, zoomToBuilding]
  );

  const handleViewOnMap = () => {
    if (isSkillsPageOpen && zoomToHome) {
      // For skills page, zoom to home and show tooltip
      zoomToHome();
    } else if (selectedBuilding && zoomToBuilding) {
      zoomToBuilding(selectedBuilding.category, selectedBuilding.id);
    }
    // Close sidebar on mobile after viewing on map
    if (isMobile) {
      setIsLeftPanelVisible(false);
    }
  };

  const handleProfileClick = useCallback(() => {
    if (zoomToHome) {
      zoomToHome();
      // Close sidebar on mobile after viewing on map
      if (isMobile) {
        setIsLeftPanelVisible(false);
      }
    }
  }, [zoomToHome, isMobile, setIsLeftPanelVisible]);

  const handleProfileKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleProfileClick();
      }
    },
    [handleProfileClick]
  );

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleKeyDownSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchQuery("");
    }
  };

  const handleOpenScreenshotModal = (index: number) => {
    setActiveScreenshotIndex(index);
    setIsScreenshotModalOpen(true);
  };

  const handleCloseScreenshotModal = () => {
    setIsScreenshotModalOpen(false);
  };

  const handleNextScreenshot = (total: number) => {
    setActiveScreenshotIndex((prev) => (prev + 1) % total);
  };

  const handlePrevScreenshot = (total: number) => {
    setActiveScreenshotIndex((prev) => (prev - 1 + total) % total);
  };

  // Filter resume items based on search query
  const filteredExperiences = useMemo(() => {
    if (!resume) return [];
    if (!searchQuery) return resume.experiences;
    const query = searchQuery.toLowerCase();
    return resume.experiences.filter(
      (exp) =>
        exp.company.toLowerCase().includes(query) ||
        exp.position.toLowerCase().includes(query) ||
        exp.location.toLowerCase().includes(query) ||
        exp.technologies.some((tech) => tech.toLowerCase().includes(query))
    );
  }, [resume, searchQuery]);

  const filteredEducation = useMemo(() => {
    if (!resume) return [];
    if (!searchQuery) return resume.education;
    const query = searchQuery.toLowerCase();
    return resume.education.filter(
      (edu) =>
        edu.school.toLowerCase().includes(query) ||
        edu.degree.toLowerCase().includes(query) ||
        edu.location.toLowerCase().includes(query)
    );
  }, [resume, searchQuery]);

  const filteredInterests = useMemo(() => {
    if (!resume) return [];
    if (!searchQuery) return resume.interests;
    const query = searchQuery.toLowerCase();
    return resume.interests.filter((int) =>
      int.name.toLowerCase().includes(query)
    );
  }, [resume, searchQuery]);

  const filteredProjects = useMemo(() => {
    if (!resume) return [];
    if (!searchQuery) return resume.personalProjects;
    const query = searchQuery.toLowerCase();
    return resume.personalProjects.filter(
      (proj) =>
        proj.name.toLowerCase().includes(query) ||
        proj.description.toLowerCase().includes(query) ||
        proj.technologies.some((tech) => tech.toLowerCase().includes(query))
    );
  }, [resume, searchQuery]);

  const hasResults =
    filteredExperiences.length > 0 ||
    filteredEducation.length > 0 ||
    filteredInterests.length > 0 ||
    filteredProjects.length > 0;

  // Scroll to top when opening a detail page
  useEffect(() => {
    if (selectedBuilding && detailViewRef.current) {
      // Wait for the transition to start and DOM to be ready
      // Use requestAnimationFrame to ensure the element is rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (detailViewRef.current) {
            detailViewRef.current.scrollTo({ top: 0, behavior: "smooth" });
            setScrollY(0);
          }
        }, 50);
      });
    }
  }, [selectedBuilding]);

  // Parallax scroll effect for cover photo - throttled for performance
  useEffect(() => {
    const scrollContainer = detailViewRef.current;
    if (!scrollContainer || !selectedExperience) return;

    let rafId: number | null = null;
    let lastScrollTop = 0;

    const handleScroll = () => {
      if (rafId !== null) return; // Skip if already scheduled

      rafId = requestAnimationFrame(() => {
        const scrollTop = scrollContainer.scrollTop;
        // Only update if scroll position changed significantly (performance optimization)
        if (Math.abs(scrollTop - lastScrollTop) > 1) {
          // Parallax effect: background moves slower than scroll (0.5x speed)
          setScrollY(scrollTop * 0.5);
          lastScrollTop = scrollTop;
        }
        rafId = null;
      });
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [selectedExperience]);

  return (
    <>
      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <button
          onClick={handleToggleLeftPanel}
          onKeyDown={handleKeyDownToggle}
          data-toggle-button
          className={`absolute top-6 z-50 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 p-2.5 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLeftPanelVisible
              ? selectedBuilding
                ? "left-[536px]"
                : "left-[436px]"
              : "left-4"
          }`}
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
          aria-label={
            isLeftPanelVisible ? "Hide left panel" : "Show left panel"
          }
          tabIndex={0}
        >
          {isLeftPanelVisible ? (
            <IoChevronBackOutline className="w-4 h-4" />
          ) : (
            <IoChevronForwardOutline className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Bottom Navigation Bar - Mobile Only */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
          <div className="flex items-center justify-center h-16 px-4">
            <button
              onClick={() => {
                if (!isLeftPanelVisible) {
                  setIsLeftPanelVisible(true);
                  setSheetState("half"); // Start at half when opening
                } else {
                  // If expanded, close completely. Otherwise cycle through states
                  if (sheetState === "expanded") {
                    // Close completely
                    setIsLeftPanelVisible(false);
                    // Reset state after a brief delay to ensure smooth transition
                    setTimeout(() => {
                      setSheetState("half");
                    }, 300);
                  } else if (sheetState === "half") {
                    setSheetState("expanded");
                  } else if (sheetState === "collapsed") {
                    setSheetState("half");
                  }
                }
              }}
              onKeyDown={handleKeyDownToggle}
              data-toggle-button
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation ${
                isLeftPanelVisible
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
              }`}
              aria-label={
                !isLeftPanelVisible
                  ? "Open menu"
                  : sheetState === "expanded"
                  ? "Close menu"
                  : sheetState === "half"
                  ? "Expand menu"
                  : "Expand menu"
              }
              tabIndex={0}
            >
              {!isLeftPanelVisible ? (
                <>
                  <IoMenuOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">Menu</span>
                </>
              ) : sheetState === "expanded" ? (
                <>
                  <IoCloseOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">Close</span>
                </>
              ) : (
                <>
                  <IoChevronUpOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">Expand</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Left Panel Container - Desktop: Sidebar, Mobile: Bottom Sheet */}
      <div
        data-sidebar
        className={`${
          isMobile
            ? "fixed bottom-0 left-0 right-0 z-[55]"
            : "absolute top-0 left-0 h-full z-40"
        } transition-all duration-300 ease-out ${
          isMobile
            ? isLeftPanelVisible
              ? "translate-y-0"
              : "translate-y-full pointer-events-none"
            : isLeftPanelVisible
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-full pointer-events-none"
        }`}
        style={{
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: 1000,
        }}
      >
        <div
          ref={sheetRef}
          className={`bg-white shadow-2xl flex flex-col ${
            isMobile
              ? `w-full rounded-t-3xl overflow-y-auto ${
                  isDragging ? "" : "transition-all duration-300 ease-out"
                }`
              : `rounded-lg m-2 overflow-hidden transition-[width] duration-150 ease-in-out ${
                  selectedBuilding ? "w-[520px]" : "w-[420px]"
                }`
          }`}
          style={useMemo(() => {
            if (!isMobile) {
              return { height: "calc(100% - 1rem)" };
            }

            const viewportHeight = window.innerHeight;
            const navBarHeight = 0; // 4rem = 64px
            const maxHeight = viewportHeight - navBarHeight;
            const halfHeight = viewportHeight * 0.5;
            const collapsedHeight = 153; // Peek height

            if (isDragging) {
              // During drag, adjust height based on drag distance
              let baseHeight: number;
              if (dragStartState.current === "expanded") {
                baseHeight = maxHeight;
              } else if (dragStartState.current === "half") {
                baseHeight = halfHeight;
              } else {
                baseHeight = collapsedHeight;
              }

              const newHeight = Math.max(
                collapsedHeight,
                Math.min(maxHeight, baseHeight - sheetDragY)
              );
              return {
                height: `${newHeight}px`,
                maxHeight: `${maxHeight}px`,
              };
            } else {
              // When not dragging, use fixed heights based on state
              // If sheet is not visible, height should be 0
              if (!isLeftPanelVisible) {
                return {
                  height: "0px",
                  maxHeight: `${maxHeight}px`,
                };
              }

              let height: string;
              if (sheetState === "expanded") {
                height = `${maxHeight}px`;
              } else if (sheetState === "half") {
                height = `${halfHeight}px`;
              } else {
                height = `${collapsedHeight}px`;
              }
              return {
                height,
                maxHeight: `${maxHeight}px`,
              };
            }
          }, [
            isMobile,
            isDragging,
            sheetDragY,
            sheetState,
            isLeftPanelVisible,
          ])}
        >
          {/* Drag Handle - Mobile Only */}
          {isMobile && (
            <div
              className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-manipulation select-none"
              onMouseDown={handleSheetDragStart}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleSheetDragStart(e);
              }}
              onClick={() => {
                // Only toggle on click if we didn't just drag
                if (!isDragging && Math.abs(sheetDragY) < 5) {
                  handleToggleSheetExpanded();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggleSheetExpanded();
                }
              }}
              aria-label={
                sheetState === "expanded"
                  ? "Collapse sheet"
                  : sheetState === "half"
                  ? "Expand or collapse sheet"
                  : "Expand sheet"
              }
              tabIndex={0}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          )}
          {/* Profile Section - Only show in list view */}
          {showProfileSection && resume && resume.name && (
            <div
              ref={profileSectionRef}
              key={`profile-section-${
                selectedBuilding === null ? "visible" : "hidden"
              }`}
              className="px-4 md:px-6 py-3 bg-white border-b border-gray-200"
            >
              {/* Image and Name/Job Row with View Skills Button */}
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleProfileClick}
                  onKeyDown={handleProfileKeyDown}
                  className="flex items-center gap-3 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg -mx-2 px-2 py-1 hover:bg-gray-50 transition-colors"
                  aria-label="Go to my house on the map"
                  tabIndex={0}
                >
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full flex-shrink-0 shadow-sm overflow-hidden">
                    <img
                      src="/dp.jpg"
                      alt={resume.name || "Profile"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && resume.name) {
                          parent.className =
                            "w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-lg font-semibold shadow-sm";
                          parent.textContent = resume.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase();
                        }
                      }}
                    />
                  </div>

                  {/* Name and Title - Stacked on right */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <h1 className="text-base font-medium text-gray-900 leading-tight truncate">
                      {resume.name || "Name not available"}
                    </h1>
                    <p className="text-xs text-gray-600 leading-tight truncate">
                      {resume.title || "Title not available"}
                    </p>
                  </div>
                </button>

                {/* View Skills Button */}
                <button
                  onClick={() => {
                    setIsSkillsPageOpen(true);
                    setIsLeftPanelVisible(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsSkillsPageOpen(true);
                      setIsLeftPanelVisible(true);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="View skills"
                  tabIndex={0}
                >
                  <IoCodeSlashOutline className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    Skills
                  </span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                {resume.email && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${resume.email}`}
                      className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 transition-colors flex-1 min-w-0"
                      aria-label={`Email ${resume.email}`}
                    >
                      <IoMailOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{resume.email}</span>
                    </a>
                    {/* Social Links - LinkedIn and GitHub */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {resume.linkedin && (
                        <a
                          href={`https://${resume.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-200"
                          aria-label="LinkedIn profile"
                        >
                          <FaLinkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {resume.github && (
                        <a
                          href={`https://${resume.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 transition-all duration-200"
                          aria-label="GitHub profile"
                        >
                          <FaGithub className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {resume.website && (
                        <a
                          href={
                            resume.website.startsWith("http")
                              ? resume.website
                              : `https://${resume.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-200"
                          aria-label="Personal website"
                        >
                          <IoGlobeOutline className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {resume.phone && (
                    <a
                      href={`tel:${resume.phone.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 transition-colors"
                      aria-label={`Call ${resume.phone}`}
                    >
                      <IoCallOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{resume.phone}</span>
                    </a>
                  )}
                  {resume.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <IoLocationOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{resume.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Header Section with Back Button - Only show in detail view or skills page */}
          {(selectedBuilding || isSkillsPageOpen) && (
            <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={handleBackToList}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleBackToList();
                    }
                  }}
                  className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transition-all duration-200 flex-shrink-0 touch-manipulation"
                  aria-label="Back to list"
                  tabIndex={0}
                >
                  <IoArrowBackOutline className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base md:text-lg font-medium text-gray-900 leading-tight truncate">
                    {isSkillsPageOpen ? "Skills" : resume?.name || ""}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">
                    {isSkillsPageOpen
                      ? "Technical expertise and proficiencies"
                      : resume?.title || ""}
                  </p>
                </div>
                {/* View on Map Button - Mobile Only */}
                {isMobile && (selectedBuilding || isSkillsPageOpen) && (
                  <button
                    onClick={handleViewOnMap}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleViewOnMap();
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex-shrink-0 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="View on map"
                    tabIndex={0}
                  >
                    <IoLocationOutline className="w-4 h-4" />
                    <span className="text-xs font-medium whitespace-nowrap">
                      View on Map
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search Bar - Google Maps Style - Only show in list view, hidden on mobile */}
          {!selectedBuilding && !isSkillsPageOpen && !isMobile && (
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDownSearch}
                  placeholder="Search places..."
                  className="w-full pl-12 pr-12 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white hover:border-gray-400 transition-all duration-200"
                  aria-label="Search resume items"
                  tabIndex={0}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    onKeyDown={(e) => e.key === "Enter" && handleClearSearch()}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                    aria-label="Clear search"
                    tabIndex={0}
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content - List, Detail View, or Skills Page */}
          {isSkillsPageOpen ? (
            /* Skills Page View */
            <div
              key="skills-view"
              ref={detailViewRef}
              className={`flex-1 overflow-y-auto opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards] ${
                isMobile ? "pb-20" : ""
              }`}
            >
              <div className="px-6 py-5">
                {/* Strong Skills */}
                {skills.strong && skills.strong.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Core Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.strong.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                        >
                          <span className="text-gray-900 font-medium">
                            {skill.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experienced Skills */}
                {skills.experienced && skills.experienced.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Experienced
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.experienced.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        >
                          <span className="text-gray-900 font-medium">
                            {skill.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialized Skills */}
                {skills.specialized && skills.specialized.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Specialized
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.specialized.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        >
                          <span className="text-gray-900 font-medium">
                            {skill.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : selectedBuilding ? (
            /* Detail View - Google Style */
            <div
              key="detail-view"
              ref={detailViewRef}
              className={`flex-1 overflow-y-auto opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards] ${
                isMobile ? "pb-20" : ""
              }`}
            >
              {/* Work Experience Detail */}
              {selectedExperience && (
                <div>
                  {/* Header Section with Cover Photo and Logo */}
                  <div
                    ref={headerRef}
                    className="relative w-full mb-6 overflow-hidden"
                  >
                    {/* Cover Photo Background with Parallax */}
                    {selectedExperience.coverPhoto && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${selectedExperience.coverPhoto})`,
                          opacity: 0.05,
                          transform: `translate3d(0, ${scrollY}px, 0)`,
                          willChange: "transform",
                          backfaceVisibility: "hidden",
                        }}
                      />
                    )}
                    <div className="relative px-6 py-16 flex flex-col items-center justify-center min-h-[280px]">
                      {/* Company Logo - Big and on Top */}
                      <div className="flex-shrink-0">
                        {selectedExperience.logo &&
                        !logoErrors.has(selectedExperience.id) ? (
                          <img
                            src={selectedExperience.logo}
                            alt={`${selectedExperience.company} logo`}
                            className="max-w-64 max-h-32 w-auto h-auto object-contain"
                            style={{ maxHeight: "128px" }}
                            onError={() => {
                              setLogoErrors((prev) =>
                                new Set(prev).add(selectedExperience.id)
                              );
                            }}
                          />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center">
                            <IoBriefcaseOutline className="w-16 h-16 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="px-6">
                    {/* Company Info */}
                    <div className="mb-6 w-full">
                      <h2 className="text-2xl font-medium text-gray-900 mb-1">
                        {selectedExperience.company}
                      </h2>
                      <p className="text-base text-gray-600 mb-4">
                        {selectedExperience.position}
                      </p>
                      <div className="flex flex-row items-center gap-2 text-sm w-full overflow-hidden flex-wrap">
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                          <IoCalendarOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 whitespace-nowrap">
                            {selectedExperience.startDate}
                          </span>
                          <span className="text-gray-400 mx-0.5">–</span>
                          <span className="text-gray-700 whitespace-nowrap">
                            {selectedExperience.endDate}
                          </span>
                        </div>
                        {selectedExperience.location && (
                          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                            <IoLocationOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 whitespace-nowrap">
                              {selectedExperience.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-3 text-gray-900">
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {selectedExperience.description}
                      </p>
                    </div>

                    {selectedExperience.achievements &&
                      selectedExperience.achievements.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium mb-3 text-gray-900">
                            Key Achievements
                          </h3>
                          <ul className="space-y-2.5">
                            {selectedExperience.achievements.map(
                              (achievement, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3 text-gray-700"
                                >
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                  <span className="leading-relaxed text-sm">
                                    {achievement}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    <div>
                      <h3 className="text-sm font-medium mb-3 text-gray-900">
                        Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExperience.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors cursor-default"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Detail */}
              {selectedEducation && (
                <div className="px-6 py-6">
                  <div className="mb-6 w-full">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-md mb-4">
                      <IoSchoolOutline className="w-3.5 h-3.5" />
                      Education
                    </span>
                    <h2 className="text-2xl font-medium text-gray-900 mb-2">
                      {selectedEducation.school}
                    </h2>
                    <p className="text-base text-gray-600 mb-1">
                      {selectedEducation.degree}
                    </p>
                    {selectedEducation.field && (
                      <p className="text-sm text-gray-500 mb-4">
                        {selectedEducation.field}
                      </p>
                    )}
                    <div className="flex flex-row items-center gap-2 text-sm w-full overflow-hidden">
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                        <IoCalendarOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700 whitespace-nowrap">
                          Graduated {selectedEducation.graduationDate}
                        </span>
                      </div>
                      {selectedEducation.location && (
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg flex-shrink-0 ml-auto">
                          <IoLocationOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 whitespace-nowrap">
                            {selectedEducation.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3 text-gray-900">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {selectedEducation.description}
                    </p>
                  </div>

                  {selectedEducation.achievements &&
                    selectedEducation.achievements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-gray-900">
                          Achievements
                        </h3>
                        <ul className="space-y-2">
                          {selectedEducation.achievements.map(
                            (achievement, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2.5 text-gray-700"
                              >
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span className="leading-relaxed text-sm">
                                  {achievement}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Interest Detail */}
              {selectedInterest && (
                <div className="px-6 py-5">
                  <div className="mb-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md mb-3 ${
                        selectedInterest.category === "sports"
                          ? "bg-red-50 text-red-700"
                          : selectedInterest.category === "hobby"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {getInterestCategoryIcon(selectedInterest.category)}
                      {selectedInterest.category === "sports"
                        ? "Sports"
                        : selectedInterest.category === "hobby"
                        ? "Hobby"
                        : "Interest"}
                    </span>
                    <h2 className="text-2xl font-normal mb-3 text-gray-900">
                      {selectedInterest.name}
                    </h2>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-sm font-medium mb-2 text-gray-900">
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {selectedInterest.description}
                    </p>
                  </div>

                  {selectedInterest.details &&
                    selectedInterest.details.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-gray-900">
                          Details
                        </h3>
                        <ul className="space-y-2">
                          {selectedInterest.details.map((detail) => (
                            <li
                              key={detail}
                              className="flex items-start gap-2.5 text-gray-700"
                            >
                              <div
                                className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  selectedInterest.category === "sports"
                                    ? "bg-red-500"
                                    : selectedInterest.category === "hobby"
                                    ? "bg-teal-500"
                                    : "bg-orange-500"
                                }`}
                              ></div>
                              <span className="leading-relaxed text-sm">
                                {detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Personal Project Detail */}
              {selectedProject && (
                <div className="px-6 py-5">
                  <div className="mb-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md mb-3">
                      <IoCodeSlashOutline className="w-3 h-3" />
                      Personal Project
                    </span>
                    <h2 className="text-2xl font-normal text-gray-900 mb-3">
                      {selectedProject.name}
                    </h2>
                  </div>

                  {selectedProject.screenshots &&
                    selectedProject.screenshots.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-medium mb-3 text-gray-900">
                          Screenshots
                        </h3>
                        <div className="flex flex-col gap-4 overflow-y-auto pb-2 max-h-[700px]">
                          {selectedProject.screenshots.map((src, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleOpenScreenshotModal(index)}
                              className="flex-shrink-0 w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:border-purple-400 hover:shadow-md transition-all"
                              aria-label={`Open screenshot ${index + 1} of ${
                                selectedProject.name
                              }`}
                            >
                              <img
                                src={src}
                                alt={`${selectedProject.name} screenshot ${
                                  index + 1
                                }`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mb-5">
                    <h3 className="text-sm font-medium mb-2 text-gray-900">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {selectedProject.description}
                    </p>
                  </div>

                  {selectedProject.technologies &&
                    selectedProject.technologies.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-medium mb-3 text-gray-900">
                          Technologies
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProject.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors cursor-default"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {(selectedProject.githubUrl || selectedProject.liveUrl) && (
                    <div className="flex gap-2">
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          <IoCodeSlashOutline className="w-3.5 h-3.5" />
                          View Code
                        </a>
                      )}
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <IoStarOutline className="w-3.5 h-3.5" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div
              key="list-view"
              className={`flex-1 overflow-y-auto opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards] ${
                isMobile ? "pb-20" : ""
              }`}
            >
              {!hasResults && searchQuery ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No results found</p>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-2">
                  {/* Work Experience Section */}
                  {filteredExperiences.length > 0 && (
                    <div>
                      <div className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Work Experience
                      </div>
                      <div className="space-y-2">
                        {filteredExperiences.map((exp) => {
                          const isSelected = isBuildingSelected(
                            selectedBuilding,
                            "work",
                            exp.id
                          );
                          return (
                            <ExperienceListItem
                              key={exp.id}
                              exp={exp}
                              isSelected={isSelected}
                              onSelect={handleSelectBuilding}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  {filteredEducation.length > 0 && (
                    <div className="mt-4">
                      <div className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Education
                      </div>
                      <div className="space-y-2">
                        {filteredEducation.map((edu) => {
                          const isSelected = isBuildingSelected(
                            selectedBuilding,
                            "education",
                            edu.id
                          );
                          return (
                            <EducationListItem
                              key={edu.id}
                              edu={edu}
                              isSelected={isSelected}
                              onSelect={handleSelectBuilding}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Personal Projects Section */}
                  {filteredProjects.length > 0 && (
                    <div className="mt-4">
                      <div className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Personal Projects
                      </div>
                      <div className="space-y-2">
                        {filteredProjects.map((proj) => {
                          const isSelected = isBuildingSelected(
                            selectedBuilding,
                            "project",
                            proj.id
                          );
                          return (
                            <ProjectListItem
                              key={proj.id}
                              proj={proj}
                              isSelected={isSelected}
                              onSelect={handleSelectBuilding}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Interests Section */}
                  {filteredInterests.length > 0 && (
                    <div className="mt-4">
                      <div className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Interests
                      </div>
                      <div className="space-y-2">
                        {filteredInterests.map((int) => {
                          const isSelected = isBuildingSelected(
                            selectedBuilding,
                            "interest",
                            int.id
                          );
                          return (
                            <InterestListItem
                              key={int.id}
                              int={int}
                              isSelected={isSelected}
                              onSelect={handleSelectBuilding}
                              getInterestCategoryIcon={getInterestCategoryIcon}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isScreenshotModalOpen &&
        selectedProject &&
        selectedProject.screenshots &&
        selectedProject.screenshots.length > 0 && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gradient-to-b from-black/80 via-black/70 to-black/80">
            <div className="relative w-full">
              <button
                type="button"
                onClick={handleCloseScreenshotModal}
                className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
                aria-label="Close screenshot gallery"
              >
                <IoCloseOutline className="w-7 h-7" />
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handlePrevScreenshot(selectedProject.screenshots!.length)
                  }
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  aria-label="Previous screenshot"
                >
                  <IoChevronBackOutline className="w-6 h-6" />
                </button>

                <div className="flex-1 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center max-h-[100vh] backdrop-blur-lg">
                  <img
                    src={selectedProject.screenshots[activeScreenshotIndex]}
                    alt={`${selectedProject.name} screenshot ${
                      activeScreenshotIndex + 1
                    }`}
                    className="max-h-[100vh] w-auto max-w-full object-contain"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleNextScreenshot(selectedProject.screenshots!.length)
                  }
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  aria-label="Next screenshot"
                >
                  <IoChevronForwardOutline className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-3 text-center text-xs text-white/80">
                Screenshot {activeScreenshotIndex + 1} of{" "}
                {selectedProject.screenshots.length}
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default ResumeUI;
