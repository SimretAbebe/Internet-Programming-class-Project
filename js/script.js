let memories = [];
const STORAGE_KEY = "cs55_memories";
let currentPage = "";

// PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("memories.html")) {
    currentPage = "memories";
    loadMemories();
  } else if (path.includes("submit.html")) {
    currentPage = "submit";
    setupFormSubmission();
  } else {
    currentPage = "home";
  }

  const main = document.querySelector("main");
  if (main) main.classList.add("fade-in");
});

// FORM SETUP
function setupFormSubmission() {
  const form = document.getElementById("memoryForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

// HANDLE SUBMIT 
function handleSubmit(event) {
  event.preventDefault();

  const formData = getFormData();
  const validation = validateForm(formData);

  if (!validation.isValid) {
    alert("Please fix the following errors:\n" + validation.errors.join("\n"));
    return;
  }

  // IMAGE HANDLING (ANY IMAGE TYPE)
  if (formData.imageFile) {
    const reader = new FileReader();

    reader.onload = () => {
      const memory = createMemoryObject(formData, reader.result);
      saveMemory(memory);
      finishSubmission();
    };

    reader.readAsDataURL(formData.imageFile);
  } else {
    const memory = createMemoryObject(formData, null);
    saveMemory(memory);
    finishSubmission();
  }
}

// FINISH SUBMISSION 
function finishSubmission() {
  document.getElementById("memoryForm").reset();
  alert("Your memory has been saved to the Time Capsule! 🎉");

  if (confirm("Would you like to view your memory on the Memory Wall?")) {
    window.location.href = "memories.html";
  }
}

//  GET FORM DATA 
function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    year: document.getElementById("year").value,
    department: document.getElementById("department").value,
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value,
    emoji: document.getElementById("emoji").value.trim(),
    imageFile: document.getElementById("image")?.files[0] || null,
  };
}

// VALIDATION 
function validateForm(data) {
  let errors = [];

  if (!data.year) errors.push("Year is required");
  if (!data.department) errors.push("Department is required");
  if (!data.title || data.title.length < 3)
    errors.push("Title must be at least 3 characters");
  if (!data.description || data.description.length < 10)
    errors.push("Description must be at least 10 characters");
  if (!data.category) errors.push("Category is required");

  const validYears = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
  if (data.year && !validYears.includes(data.year)) {
    errors.push("Invalid year selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// CREATE MEMORY OBJECT
function createMemoryObject(data, imageBase64) {
  const now = new Date();

  return {
    id: Date.now(),
    name: data.name || "Anonymous",
    year: data.year,
    department: data.department,
    title: data.title,
    description: data.description,
    category: data.category,
    emoji: data.emoji,
    image: imageBase64, 
    dateCreated: now.toLocaleDateString(),
    timestamp: now.getTime(),
  };
}

// SAVE MEMORY 
function saveMemory(memory) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  stored.push(memory);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  memories = stored;
}

//LOAD MEMORIES
function loadMemories() {
  memories = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  renderMemories();
}

//  RENDER MEMORIES 
function renderMemories() {
  const grid = document.getElementById("memoriesGrid");
  const empty = document.getElementById("noMemories");
  if (!grid) return;

  grid.innerHTML = "";

  if (memories.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  memories.sort((a, b) => b.timestamp - a.timestamp);

  memories.forEach((memory) => {
    grid.appendChild(createMemoryCard(memory));
  });
}

//  CREATE MEMORY CARD 
function createMemoryCard(memory) {
  const card = document.createElement("div");
  card.className = "memory-card";

  card.innerHTML = `
        <div class="memory-meta">
            <span class="memory-name">${memory.name}</span>
            <span class="memory-category">${memory.category}</span>
        </div>
        <h3 class="memory-title">${memory.title}</h3>
        <p class="memory-description">${memory.description}</p>
    `;

  // IMAGE DISPLAY
  if (memory.image) {
    const img = document.createElement("img");
    img.src = memory.image;
    img.alt = "Memory image";
    img.className = "memory-image";
    card.appendChild(img);
  }

  if (memory.emoji) {
    const emojiDiv = document.createElement("div");
    emojiDiv.className = "memory-emoji";
    emojiDiv.textContent = memory.emoji;
    card.appendChild(emojiDiv);
  }

  card.addEventListener("click", () => {
    card.classList.toggle("expanded");

    if (card.classList.contains("expanded")) {
      const details = document.createElement("div");
      details.className = "memory-details";
      details.innerHTML = `
                <small>Year: ${memory.year} | Department: ${memory.department}</small><br>
                <small>Shared on: ${memory.dateCreated}</small>
            `;
      card.appendChild(details);
    } else {
      const details = card.querySelector(".memory-details");
      if (details) details.remove();
    }
  });

  return card;
}
