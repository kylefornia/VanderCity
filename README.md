# CityWork - Interactive 3D Resume City

A visually stunning procedural 3D city built with Three.js and Next.js that showcases your professional resume and job history in an interactive, immersive environment.

## Features

### City Elements
- **Buildings**: Procedurally generated buildings with varying heights, styles, and detailed windows
- **Streets**: Complete street grid with sidewalks, lane markings, and realistic road surfaces
- **Traffic Lights**: Animated traffic lights at intersections with realistic timing cycles
- **Trees & Vegetation**: Procedurally placed trees along sidewalks and in city blocks
- **Parks**: Green spaces with benches, paths, and park trees
- **City Details**: Street lights, trash cans, street signs, and other urban elements

### Animated Elements
- **People**: Animated pedestrians walking along sidewalks with realistic movement
- **Cars**: Vehicles driving through the city streets with varied colors and speeds

### Resume Integration
- **Interactive Buildings**: Click on special buildings to view job history and work experience
- **Resume UI**: Overlay panels displaying your professional information
- **Experience Details**: Detailed modals showing company information, roles, technologies, and descriptions

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customization

### Updating Resume Data

Edit `context/ResumeContext.tsx` to customize your resume information:

```typescript
const defaultResume: ResumeData = {
  name: 'Your Name',
  title: 'Your Title',
  email: 'your.email@example.com',
  location: 'City, Country',
  summary: 'Your professional summary...',
  skills: ['Skill 1', 'Skill 2', ...],
  experiences: [
    {
      id: '1',
      company: 'Company Name',
      position: 'Your Position',
      duration: '2020 - Present',
      description: 'Job description...',
      technologies: ['Tech 1', 'Tech 2'],
      buildingPosition: [20, 0, 20], // X, Y, Z coordinates
      buildingColor: '#4F46E5', // Building color
    },
    // Add more experiences...
  ],
}
```

### City Configuration

Adjust city parameters in the city components:
- `GRID_SIZE`: Number of city blocks (default: 9x9)
- `BLOCK_SIZE`: Size of each block
- `STREET_WIDTH`: Width of streets
- Number of people, cars, trees, etc.

## Controls

- **Mouse Drag**: Rotate the camera around the city
- **Scroll Wheel**: Zoom in/out
- **Click Buildings**: View job history for resume buildings
- **Pan**: Hold right-click and drag (if enabled)

## Technologies

- **Next.js 14**: React framework
- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **Drei**: Useful helpers for React Three Fiber
- **TypeScript**: Type safety
- **TailwindCSS**: Styling

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with Canvas
│   └── globals.css         # Global styles
├── components/
│   ├── CityScene.tsx       # Main city scene component
│   ├── ResumeUI.tsx        # UI overlay for resume info
│   └── city/
│       ├── Buildings.tsx   # Building generation
│       ├── Cars.tsx        # Animated cars
│       ├── CityDetails.tsx # Street lights, signs, etc.
│       ├── Parks.tsx      # Park generation
│       ├── People.tsx     # Animated pedestrians
│       ├── StreetGrid.tsx # Street and sidewalk system
│       ├── TrafficLight.tsx # Traffic light component
│       └── Trees.tsx      # Tree generation
└── context/
    └── ResumeContext.tsx   # Resume data management
```

## Performance Tips

- Adjust the number of people, cars, and trees based on your hardware
- Reduce `GRID_SIZE` for smaller cities
- Disable shadows if experiencing performance issues

## License

MIT









