# Data Alchemist – Resource‑Allocation Configurator

**Data Alchemist** is a web-based tool for managing, validating, and prioritizing operational entities such as **Clients**, **Workers**, and **Tasks**. It provides an intuitive interface to define **Business Rules**, set **Prioritization Weights**, and export clean, validated datasets for downstream use.

## Features

- **Entity Management** – View and manage data for Clients, Workers, and Tasks in an interactive grid.
- **Business Rules** – Create, edit, and delete rules dynamically, including:
  - Co-run rules (run tasks together)
  - Slot restrictions
  - Load limits
  - Phase windows
  - Pattern matches (regex-based)
- **Prioritization** – Assign weights (0–100) to key criteria with sliders or apply preset profiles.
- **Validation Panel** – Easily view and toggle validation issues without losing focus on the main entity grid.
- **Local Storage Persistence** – Rules and priorities are stored in the browser for quick reloads.
- **Data Export** – One-click export to a `.zip` file containing:
  - `data.xlsx` – Validated Clients, Workers, and Tasks (separate sheets)
  - `rules.json` – All business rules and prioritization weights

## Tech Stack

- **Next.js** + **React** – UI framework
- **TypeScript** – Strong typing and maintainability
- **Zustand** – State management
- **shadcn/ui** + **Tailwind CSS** – Consistent, modern UI components
- **xlsx** – Excel export functionality
