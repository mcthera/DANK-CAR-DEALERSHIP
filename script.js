// --- CONFIGURATION FOR JSONBIN & CLOUDINARY ---
const JSONBIN_BIN_ID = "6ab85de2ac6210605af9449d"; // Replace with your JSONBin Bin ID
const JSONBIN_API_KEY = "$2a$10$naPldLFtbAB1mQmuzuFfHevWBpB22kc8qHLUo1HXwYOJsk3C2ny6."; // Replace with your JSONBin Master/Access Key (Optional if bin is public)

const CLOUDINARY_CLOUD_NAME = "qfx75zm9"; // Replace with your Cloudinary Cloud Name
const CLOUDINARY_UPLOAD_PRESET = "car dealership"; // Replace with your Cloudinary Unsigned Upload Preset

// Fallback initial dataset if JSONBin ID is not configured yet
let cars = [
    {
        id: 1,
        make: "Toyota",
        model: "Land Cruiser V8",
        year: 2021,
        price: 950000,
        condition: "Foreign Used",
        body: "SUV",
        transmission: "Automatic",
        fuel: "Petrol",
        mileage: "45,000 km",
        image: "https://images.unsplash.com/photo-1594483424119-2a07474476d5?auto=format&fit=crop&w=800&q=80",
        description: "Immaculate condition Toyota Land Cruiser V8. Full customs cleared at Tema port."
    },
    {
        id: 2,
        make: "Toyota",
        model: "Hilux Pickup",
        year: 2023,
        price: 480000,
        condition: "Brand New",
        body: "Pickup",
        transmission: "Automatic",
        fuel: "Diesel",
        mileage: "1,200 km",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        description: "Brand new Toyota Hilux 4x4 pickup. Powerful GD engine."
    }
];

// DOM ELEMENTS
const carGrid = document.getElementById('car-grid');
const searchInput = document.getElementById('search-input');
const filterCondition = document.getElementById('filter-condition');
const filterBody = document.getElementById('filter-body');
const resetFiltersBtn = document.getElementById('reset-filters');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const carModal = document.getElementById('car-modal');
const closeModal = document.getElementById('close-modal');
const modalBodyContent = document.getElementById('modal-body-content');
const inquiryForm = document.getElementById('inquiry-form');

// Admin Modals & Elements
const adminTriggerBtn = document.getElementById('admin-trigger-btn');
const adminLoginModal = document.getElementById('admin-login-modal');
const closeAdminLogin = document.getElementById('close-admin-login');
const adminLoginForm = document.getElementById('admin-login-form');

const adminDashboardModal = document.getElementById('admin-dashboard-modal');
const closeAdminDashboard = document.getElementById('close-admin-dashboard');
const logoutBtn = document.getElementById('logout-btn');
const adminTableBody = document.getElementById('admin-table-body');
const openAddCarBtn = document.getElementById('open-add-car-btn');

const carFormModal = document.getElementById('car-form-modal');
const closeCarForm = document.getElementById('close-car-form');
const carManageForm = document.getElementById('car-manage-form');
const carFormTitle = document.getElementById('car-form-title');
const carImageFile = document.getElementById('car-image-file');
const uploadStatus = document.getElementById('upload-status');

// --- FETCH & SYNC WITH JSONBIN ---
async function fetchCarsFromBin() {
    if (JSONBIN_BIN_ID === "YOUR_BIN_ID_HERE") {
        displayCars(cars);
        return;
    }
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: JSONBIN_API_KEY !== "YOUR_MASTER_KEY_HERE" ? { 'X-Master-Key': JSONBIN_API_KEY } : {}
        });
        const data = await response.json();
        if (data && data.record) {
            cars = data.record.cars || cars;
        }
    } catch (error) {
        console.error("Error fetching from JSONBin, using default data.", error);
    }
    displayCars(cars);
}

async function saveCarsToBin() {
    if (JSONBIN_BIN_ID === "YOUR_BIN_ID_HERE") {
        alert("JSONBin ID is not configured. Changes are saved locally for this session.");
        return;
    }
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(JSONBIN_API_KEY !== "YOUR_MASTER_KEY_HERE" ? { 'X-Master-Key': JSONBIN_API_KEY } : {})
            },
            body: JSON.stringify({ cars: cars })
        });
    } catch (error) {
        console.error("Error saving to JSONBin:", error);
    }
}

// --- DISPLAY CARS IN SHOWROOM GRID ---
function displayCars(carsToDisplay) {
    carGrid.innerHTML = "";
    if (carsToDisplay.length === 0) {
        carGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 40px;">No vehicles match your search criteria.</p>`;
        return;
    }

    carsToDisplay.forEach(car => {
        const formattedPrice = Number(car.price).toLocaleString();
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <div class="car-img-wrapper">
                <span class="car-tag">${car.condition}</span>
                <img src="${car.image}" alt="${car.make} ${car.model}">
            </div>
            <div class="car-details">
                <div class="car-title-price">
                    <h3>${car.year} ${car.make} ${car.model}</h3>
                    <span class="car-price">GH₵ ${formattedPrice}</span>
                </div>
                <div class="car-specs">
                    <span><i class="fa-solid fa-gauge"></i> ${car.mileage}</span>
                    <span><i class="fa-solid fa-gears"></i> ${car.transmission}</span>
                    <span><i class="fa-solid fa-gas-pump"></i> ${car.fuel}</span>
                </div>
                <div class="car-actions">
                    <button class="btn btn-outline" style="border-color: var(--dark); color: var(--dark);" onclick="openCarModal(${car.id})">Details</button>
                    <a href="https://wa.me/233240000000?text=Hello%20Camo%20Motors,%20I%20am%20interested%20in%20the%20${car.year}%20${car.make}%20${car.model}" target="_blank" class="btn btn-primary">
                        <i class="fa-brands fa-whatsapp"></i> Inquire
                    </a>
                </div>
            </div>
        `;
        carGrid.appendChild(card);
    });
}

// --- FILTER LOGIC ---
function filterCars() {
    const searchTerm = searchInput.value.toLowerCase();
    const conditionVal = filterCondition.value;
    const bodyVal = filterBody.value;

    const filtered = cars.filter(car => {
        const matchesSearch = `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(searchTerm);
        const matchesCondition = conditionVal === "" || car.condition === conditionVal;
        const matchesBody = bodyVal === "" || car.body === bodyVal;
        return matchesSearch && matchesCondition && matchesBody;
    });
    displayCars(filtered);
}

searchInput.addEventListener('input', filterCars);
filterCondition.addEventListener('change', filterCars);
filterBody.addEventListener('change', filterCars);
resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterCondition.value = '';
    filterBody.value = '';
    displayCars(cars);
});

// --- MODAL HANDLING FOR SHOWROOM & ADMIN ---
window.openCarModal = function(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    const formattedPrice = Number(car.price).toLocaleString();
    modalBodyContent.innerHTML = `
        <div class="modal-car-details">
            <img src="${car.image}" alt="${car.make} ${car.model}">
            <h2>${car.year} ${car.make} ${car.model}</h2>
            <div class="price">GH₵ ${formattedPrice}</div>
            <p><strong>Condition:</strong> ${car.condition} | <strong>Body Type:</strong> ${car.body}</p>
            <p><strong>Transmission:</strong> ${car.transmission} | <strong>Fuel:</strong> ${car.fuel} | <strong>Mileage:</strong> ${car.mileage}</p>
            <p>${car.description}</p>
            <a href="https://wa.me/233240000000?text=Hello%20Camo%20Motors,%20I%20want%20to%20book%20an%20inspection%20for%20the%20${car.year}%20${car.make}%20${car.model}" target="_blank" class="btn btn-primary btn-block">
                <i class="fa-brands fa-whatsapp"></i> Book Inspection on WhatsApp
            </a>
        </div>
    `;
    carModal.style.display = 'flex';
};
closeModal.addEventListener('click', () => carModal.style.display = 'none');

// --- ADMIN AUTHENTICATION & MANAGEMENT ---
adminTriggerBtn.addEventListener('click', () => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        openAdminDashboard();
    } else {
        adminLoginModal.style.display = 'flex';
    }
});
closeAdminLogin.addEventListener('click', () => adminLoginModal.style.display = 'none');

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();

    if (user === 'MANU' && pass === 'WORD') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        adminLoginModal.style.display = 'none';
        adminLoginForm.reset();
        openAdminDashboard();
    } else {
        alert('Invalid credentials! Username is MANU and passcode is WORD.');
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    adminDashboardModal.style.display = 'none';
    alert('Logged out successfully.');
});

closeAdminDashboard.addEventListener('click', () => adminDashboardModal.style.display = 'none');

function openAdminDashboard() {
    renderAdminTable();
    adminDashboardModal.style.display = 'flex';
}

function renderAdminTable() {
    adminTableBody.innerHTML = '';
    cars.forEach(car => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${car.image}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${car.year} ${car.make} ${car.model}</strong><br><small>${car.condition}</small></td>
            <td>GH₵ ${Number(car.price).toLocaleString()}</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editCar(${car.id})">Edit</button>
                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem; background: var(--primary); color: white; border: none;" onclick="deleteCar(${car.id})">Delete</button>
            </td>
        `;
        adminTableBody.appendChild(tr);
    });
}

// --- CLOUDINARY IMAGE UPLOAD ---
carImageFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUDINARY_CLOUD_NAME") {
        alert("Cloudinary configuration missing. Please input your cloud name and upload preset in script.js.");
        return;
    }

    uploadStatus.innerText = "Uploading image to Cloudinary...";
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
            document.getElementById('car-image-url').value = data.secure_url;
            uploadStatus.innerText = "Image uploaded successfully!";
            uploadStatus.style.color = "green";
        } else {
            throw new Error("Upload failed");
        }
    } catch (err) {
        console.error(err);
        uploadStatus.innerText = "Image upload failed. Try again.";
        uploadStatus.style.color = "red";
    }
});

// --- CRUD OPERATIONS ---
openAddCarBtn.addEventListener('click', () => {
    carFormTitle.innerText = "Add New Arrival Car";
    carManageForm.reset();
    document.getElementById('car-edit-id').value = '';
    document.getElementById('car-image-url').value = '';
    uploadStatus.innerText = '';
    carFormModal.style.display = 'flex';
});

closeCarForm.addEventListener('click', () => carFormModal.style.display = 'none');

window.editCar = function(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    carFormTitle.innerText = "Update Car Details";
    document.getElementById('car-edit-id').value = car.id;
    document.getElementById('car-make').value = car.make;
    document.getElementById('car-model').value = car.model;
    document.getElementById('car-year').value = car.year;
    document.getElementById('car-price').value = car.price;
    document.getElementById('car-condition').value = car.condition;
    document.getElementById('car-body').value = car.body;
    document.getElementById('car-transmission').value = car.transmission;
    document.getElementById('car-fuel').value = car.fuel;
    document.getElementById('car-mileage').value = car.mileage;
    document.getElementById('car-image-url').value = car.image;
    document.getElementById('car-desc').value = car.description;
    uploadStatus.innerText = '';

    carFormModal.style.display = 'flex';
};

window.deleteCar = async function(id) {
    if (confirm("Are you sure you want to delete this vehicle from the showroom?")) {
        cars = cars.filter(c => c.id !== id);
        await saveCarsToBin();
        displayCars(cars);
        renderAdminTable();
    }
};

carManageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('car-edit-id').value;
    const imageUrl = document.getElementById('car-image-url').value;

    if (!imageUrl) {
        alert("Please upload an image or provide a valid image file.");
        return;
    }

    const carData = {
        id: editId ? Number(editId) : Date.now(),
        make: document.getElementById('car-make').value,
        model: document.getElementById('car-model').value,
        year: Number(document.getElementById('car-year').value),
        price: Number(document.getElementById('car-price').value),
        condition: document.getElementById('car-condition').value,
        body: document.getElementById('car-body').value,
        transmission: document.getElementById('car-transmission').value,
        fuel: document.getElementById('car-fuel').value,
        mileage: document.getElementById('car-mileage').value,
        image: imageUrl,
        description: document.getElementById('car-desc').value
    };

    if (editId) {
        const index = cars.findIndex(c => c.id === Number(editId));
        if (index !== -1) cars[index] = carData;
    } else {
        cars.unshift(carData);
    }

    await saveCarsToBin();
    displayCars(cars);
    renderAdminTable();
    carFormModal.style.display = 'none';
    alert("Showroom inventory successfully updated!");
});

// INITIALIZE APP ON LOAD
fetchCarsFromBin();