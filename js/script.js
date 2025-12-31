// This is the main JavaScript file for our CS-55 Time Capsule web application
// It handles all interactive functionality including form submission, validation,
// memory storage, and dynamic display of memories on the memory wall
// The code handles: form validation, image upload, localStorage, and dynamic UI updates

// GLOBAL VARIABLES - These store application state accessible throughout the program

// memories: Array that holds all memory objects loaded from browser storage
let memories = [];

// STORAGE_KEY: Constant string used as the key for localStorage operations
const STORAGE_KEY = "cs55_memories";

// currentPage: Variable to track which page the user is currently viewing
let currentPage = "";

// PAGE LOAD EVENT LISTENER - This runs when the HTML page finishes loading
document.addEventListener("DOMContentLoaded", () => {
  // Get the current page URL path to determine which page we're on
  const path = window.location.pathname;

  // Check if we're on the memory wall display page
  if (path.includes("memories.html")) {
    // Set current page tracker for potential future use
    currentPage = "memories";
    // Load all saved memories from storage and display them
    loadMemories();

    // Check if we're on the memory submission form page
  } else if (path.includes("submit.html")) {
    // Set current page tracker
    currentPage = "submit";
    // Setup form validation and submission handlers
    setupFormSubmission();

    // If we're on home page or any other page
  } else {
    // Set current page tracker
    currentPage = "home";
    // No special initialization needed for home page
  }

  // Add a smooth fade-in animation to the main content area for better UX
  // Optional chaining (?.) prevents errors if element doesn't exist
  const main = document.querySelector("main");
  if (main) main.classList.add("fade-in");
});

// FORM SETUP AND VALIDATION FUNCTIONS

// Setup form submission and real-time validation clearing
function setupFormSubmission() {
  // Get the memory form element by its ID from the HTML
  const form = document.getElementById("memoryForm");

  // Safety check - only proceed if form exists on this page
  if (form) {
    // Add event listener for form submission
    // When user clicks submit button, handleSubmit function will run
    form.addEventListener("submit", handleSubmit);
  }
}

// FORM SUBMISSION HANDLING

// Main form submission handler - called when user clicks submit button
function handleSubmit(event) {
  // Prevent the default form submission behavior (page reload)
  // This allows us to handle the submission with JavaScript instead
  event.preventDefault();

  // Collect all form input values into a JavaScript object
  const formData = getFormData();

  // Validate the form data to check for missing/invalid fields
  const validation = validateForm(formData);

  //If validation failed
  if (!validation.isValid) {
    // Show alert popup with list of validation errors
    alert("Please fix the following errors:\n" + validation.errors.join("\n"));
    // Stop form processing - user must fix errors first
    return;
  }

  // Form is valid, proceed with saving
  // Check if user uploaded an image file
  if (formData.imageFile) {
    // IMAGE PROCESSING: Create FileReader to convert image to base64 string
    const reader = new FileReader();

    // When file reading completes successfully, this callback runs
    reader.onload = () => {
      // Create memory object with the image data
      const memory = createMemoryObject(formData, reader.result);
      // Save to browser storage
      saveMemory(memory);
      // Show success message and reset form
      finishSubmission();
    };

    // Start reading the uploaded image file as a data URL (base64 encoded)
    reader.readAsDataURL(formData.imageFile);
  } else {
    // NO IMAGE: User didn't upload an image
    // Create memory object without image (null)
    const memory = createMemoryObject(formData, null);
    // Save to browser storage
    saveMemory(memory);
    // Show success message and reset form
    finishSubmission();
  }
}

// Show success message and handle post-submission actions
function finishSubmission() {
  // Clear/reset all form fields to empty state for next submission
  document.getElementById("memoryForm").reset();

  // Show success alert popup to confirm memory was saved
  alert("Your memory has been saved to the Time Capsule!");

  // Ask user if they want to view their newly saved memory on the memory wall
  if (confirm("Would you like to view your memory on the Memory Wall?")) {
    // User clicked "OK" - redirect to memories page to show the new memory
    window.location.href = "memories.html";
  }
  // If user clicks "Cancel", they stay on the current page
}

// FORM DATA COLLECTION

// Extract all form input values and return as organized JavaScript object
function getFormData() {
  // Return object containing all form field values
  return {
    // Get name field value, remove extra whitespace (optional field)
    name: document.getElementById("name").value.trim(),

    // Get year dropdown selection value
    year: document.getElementById("year").value,

    // Get department dropdown selection value
    department: document.getElementById("department").value,

    // Get title field value, remove extra whitespace
    title: document.getElementById("title").value.trim(),

    // Get description field value, remove extra whitespace
    description: document.getElementById("description").value.trim(),

    // Get category dropdown selection value
    category: document.getElementById("category").value,

    // Get uploaded image file (first file from file input, or null if none)
    // Optional chaining (?.) prevents errors if image element doesn't exist
    imageFile: document.getElementById("image")?.files[0] || null,
  };
}

// FORM VALIDATION

// Validate form data and return validation result with any errors found
function validateForm(data) {
  // Array to collect any validation error messages
  let errors = [];

  // VALIDATION RULES - Check each required field has valid data

  // Year field is required - must be selected
  if (!data.year) errors.push("Year is required");

  // Department field is required - must be selected
  if (!data.department) errors.push("Department is required");

  // Title is required AND must be at least 3 characters long
  if (!data.title || data.title.length < 3)
    errors.push("Title must be at least 3 characters");

  // Description is required AND must be at least 10 characters long
  if (!data.description || data.description.length < 10)
    errors.push("Description must be at least 10 characters");

  // Category field is required - must be selected
  if (!data.category) errors.push("Category is required");

  // ADDITIONAL VALIDATION - Check if selected year is in allowed list
  // Define array of valid year options (matches HTML dropdown values)
  const validYears = [
    "1st year", // First year students
    "2nd year", // Second year students
    "3rd year", // Third year students
    "4th year", // Fourth year students
    "Graduate", // Graduate students/alumni
  ];

  // If year is selected but not in valid list, add error
  if (data.year && !validYears.includes(data.year)) {
    errors.push("Invalid year selected");
  }

  // Return validation result object
  return {
    // Boolean: true if no errors found, false if errors exist
    isValid: errors.length === 0,

    // Array of error message strings (empty if validation passed)
    errors,
  };
}

// MEMORY OBJECT CREATION AND STORAGE

// Convert form data and optional image into a structured memory object
function createMemoryObject(data, imageBase64) {
  // Get current date and time for timestamp and display
  const now = new Date();

  // Return structured memory object with all necessary properties
  return {
    // Unique ID using current timestamp (guaranteed to be unique)
    id: Date.now(),

    // Author's name (use "Anonymous" if not provided)
    name: data.name || "Anonymous",

    // Academic year (1st year, 2nd year, etc.)
    year: data.year,

    // Academic department (Computer Science, etc.)
    department: data.department,

    // Memory title/headline
    title: data.title,

    // Full memory description/story
    description: data.description,

    // Category (Joke, Win, Pain, etc.)
    category: data.category,

    // Base64 encoded image data (null if no image uploaded)
    image: imageBase64,

    // Human-readable date string for display (e.g., "12/31/2024")
    dateCreated: now.toLocaleDateString(),

    // Numeric timestamp for sorting memories by newest first
    timestamp: now.getTime(),
  };
}

// Save a memory object to the browser's localStorage (persistent storage)
function saveMemory(memory) {
  // Load existing memories from localStorage (empty array if none exist)
  // JSON.parse converts stored string back to JavaScript array
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // Add the new memory to the existing array
  stored.push(memory);

  // Save the updated array back to localStorage
  // JSON.stringify converts JavaScript array to string for storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

  // Update the global memories array to match stored data
  memories = stored;
}

// MEMORY DISPLAY AND RENDERING

// Load memories from browser storage and display them on the page
function loadMemories() {
  // Load memories array from localStorage (empty array if none exist)
  memories = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // Call function to display the loaded memories
  renderMemories();
}

// Display all memories as visual cards in a grid layout on the memory wall
function renderMemories() {
  // Get the container element where memory cards will be displayed
  const grid = document.getElementById("memoriesGrid");

  // Get the "no memories yet" message element
  const empty = document.getElementById("noMemories");

  // Safety check - if grid container doesn't exist, exit function
  if (!grid) return;

  // Clear any existing content from the grid (removes old cards)
  grid.innerHTML = "";

  // Check if there are any memories to display
  if (memories.length === 0) {
    // No memories found - show the empty state message
    if (empty) empty.style.display = "block";
    // Exit function early
    return;
  }

  // Memories exist - hide the empty message
  if (empty) empty.style.display = "none";

  // Create and add a visual card for each memory (in storage order)
  memories.forEach((memory) => {
    // Create a card element for this memory
    const card = createMemoryCard(memory);
    // Add the card to the grid container
    grid.appendChild(card);
  });
}

// Create a visual HTML card element to display a single memory
function createMemoryCard(memory) {
  // Create the main container div for the memory card
  const card = document.createElement("div");

  // Add CSS class for styling (matches our CSS rules)
  card.className = "memory-card";

  // Create the basic HTML structure for the card using template literals
  // Template literals allow embedding JavaScript variables with ${variable}
  card.innerHTML = `
    <div class="memory-meta">
      <span class="memory-name">${memory.name}</span>
      <span class="memory-category">${memory.category}</span>
    </div>
    <h3 class="memory-title">${memory.title}</h3>
    <p class="memory-description">${memory.description}</p>
  `;

  // IMAGE HANDLING - Add image to card if memory has one
  if (memory.image) {
    // Create an image element
    const img = document.createElement("img");

    // Set the image source to the base64 data stored in memory
    img.src = memory.image;

    // Add alt text for accessibility (screen readers)
    img.alt = "Memory image";

    // Add CSS class for styling the image
    img.className = "memory-image";

    // Add the image element to the card
    card.appendChild(img);
  }

  // INTERACTIVITY - Add click event listener for expanding/collapsing details
  card.addEventListener("click", () => {
    // Toggle the "expanded" CSS class (shows/hides additional details)
    card.classList.toggle("expanded");

    // Check if card is now in expanded state
    if (card.classList.contains("expanded")) {
      // Card is expanded - add additional details section
      const details = document.createElement("div");
      details.className = "memory-details";

      // Create HTML content showing year, department, and creation date
      details.innerHTML = `
        <small>Year: ${memory.year} | Department: ${memory.department}</small><br>
        <small>Shared on: ${memory.dateCreated}</small>
      `;

      // Add the details section to the card
      card.appendChild(details);
    } else {
      // Card is collapsed - remove the details section
      // Find and remove the details element (optional chaining prevents errors)
      const details = card.querySelector(".memory-details");
      if (details) details.remove();
    }
  });

  // Return the completed card element ready to be added to the page
  return card;
}

