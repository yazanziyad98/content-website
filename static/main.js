// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get references to elements
    const getRandomBtn = document.getElementById("getRandom");
    const contentTypeSelect = document.getElementById("content_type");
    const movieFields = document.querySelectorAll(".movie-field");
    const seriesFields = document.querySelectorAll(".series-field");

    // Content type change handler
    if (contentTypeSelect) {
        contentTypeSelect.addEventListener("change", function() {
            const selectedType = this.value;
            
            if (selectedType === "movie") {
                movieFields.forEach(field => field.style.display = "block");
                seriesFields.forEach(field => field.style.display = "none");
            } else if (selectedType === "series") {
                movieFields.forEach(field => field.style.display = "none");
                seriesFields.forEach(field => field.style.display = "block");
            }
        });
    }

    // Get Random Content functionality 
    if (getRandomBtn) {
        getRandomBtn.addEventListener("click", function() {
            // Add loading state
            const originalText = this.textContent;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Choosing...';
            this.disabled = true;
            
            const type = document.getElementById("randomType").value;
            const prob = document.getElementById("probability").value;
           
            let url = "/random";
            const params = new URLSearchParams();
            
            if (type) params.append("type", type);
            if (prob) params.append("prob", prob);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(html => {
                    // Create a temporary container to parse the HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    
                    // Extract just the card content from the response
                    const cardContent = tempDiv.querySelector('.card');
                    
                    const resultDiv = document.getElementById("randomResult");
                    if (cardContent) {
                        resultDiv.innerHTML = cardContent.outerHTML;
                    } else {
                        // If no card found, show the entire response for debugging
                        resultDiv.innerHTML = html;
                    }
                    
                    resultDiv.style.display = "block";
                    
                    // Add animation
                    resultDiv.style.opacity = "0";
                    resultDiv.style.transform = "translateY(20px)";
                    
                    setTimeout(() => {
                        resultDiv.style.transition = "all 0.5s ease";
                        resultDiv.style.opacity = "1";
                        resultDiv.style.transform = "translateY(0)";
                    }, 50);
                })
                .catch(error => {
                    console.error('Error fetching random content:', error);
                    const resultDiv = document.getElementById("randomResult");
                    resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
                    resultDiv.style.display = "block";
                })
                .finally(() => {
                    // Restore button state
                    this.textContent = originalText;
                    this.disabled = false;
                });
        });
    }

    // Form validation
    const addContentForm = document.getElementById("addContentForm");
    if (addContentForm) {
        addContentForm.addEventListener("submit", function(e) {
            const contentType = document.getElementById("content_type").value;
            const name = document.querySelector('input[name="name"]').value.trim();
            const rating = document.querySelector('input[name="rating"]').value;
            
            // Basic validation
            if (!name) {
                e.preventDefault();
                alert("Please enter a content name");
                return;
            }
            
            if (contentType === "movie") {
                const length = document.querySelector('input[name="length"]').value;
                if (!length || length <= 0) {
                    e.preventDefault();
                    alert("Please enter a valid movie length");
                    return;
                }
            }
            
            if (contentType === "series") {
                const seasons = document.querySelector('input[name="seasons"]').value;
                if (!seasons || seasons <= 0) {
                    e.preventDefault();
                    alert("Please enter a valid number of seasons");
                    return;
                }
            }
            
            if (!rating || rating < 0 || rating > 10) {
                e.preventDefault();
                alert("Please enter a valid rating between 0 and 10");
                return;
            }
        });
    }

    // Initialize form state
    if (contentTypeSelect) {
        // Trigger change event to set initial state
        contentTypeSelect.dispatchEvent(new Event('change'));
    }
});

// Additional utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.main-container');
    const firstChild = container.firstElementChild;
    container.insertBefore(alertDiv, firstChild.nextElementSibling);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Trigger change event to reset field visibility
        const contentTypeSelect = document.getElementById("content_type");
        if (contentTypeSelect) {
            contentTypeSelect.dispatchEvent(new Event('change'));
        }
    }
}

// Show/hide fields based on content type selection
document.getElementById('content_type').addEventListener('change', function() {
    const contentType = this.value;
    const movieFields = document.querySelectorAll('.movie-field');
    const seriesFields = document.querySelectorAll('.series-field');
    
    if (contentType === 'movie') {
        // Show movie fields, hide series fields
        movieFields.forEach(field => field.style.display = 'block');
        seriesFields.forEach(field => field.style.display = 'none');
        
        // Make movie length required, series fields not required
        document.querySelector('input[name="length"]').setAttribute('required', 'true');
        document.querySelector('input[name="seasons"]').removeAttribute('required');
        document.querySelector('input[name="episodes"]').removeAttribute('required');
    } else if (contentType === 'series') {
        // Show series fields, hide movie fields
        movieFields.forEach(field => field.style.display = 'none');
        seriesFields.forEach(field => field.style.display = 'block');
        
        // Make series fields required, movie length not required
        document.querySelector('input[name="length"]').removeAttribute('required');
        document.querySelector('input[name="seasons"]').setAttribute('required', 'true');
        document.querySelector('input[name="episodes"]').setAttribute('required');
    }
});

// Initialize the form on page load
document.addEventListener('DOMContentLoaded', function() {
    // Trigger the change event to set the correct initial state
    document.getElementById('content_type').dispatchEvent(new Event('change'));
});

 // Example content database
const contentDatabase = {
    'nuha': { 
        type: 'series', 
        genre: 'Romance', 
        length: 8, 
        rating: 10, 
         getSeasons: function() { 
            const startDate = new Date('2021-07-02'); // July 2, 2021
            const diffTime = Math.abs(new Date() - startDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
         }, 
        getEpisodes: function() { 
            const startDate = new Date('2021-07-02'); // July 2, 2021
            const today = new Date();
            const diffTime = Math.abs(today - startDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        },
        OnNetflix: 'No'
    }
};

// Autofill function
document.querySelector('input[name="name"]').addEventListener('blur', function() {
    const contentName = this.value.trim().toLowerCase(); // convert input to lowercase
    const contentData = contentDatabase[contentName];

    if (contentData) {
        // Fill basic fields
        document.getElementById('genre').value = contentData.genre;
        document.querySelector('input[name="rating"]').value = contentData.rating;
        document.getElementById('content_type').value = contentData.type;
        document.getElementById('on-netflix').value = contentData.OnNetflix;

        // Show/hide fields based on type
        if (contentData.type === 'movie') {
            document.querySelectorAll('.movie-field').forEach(f => f.style.display = 'block');
            document.querySelectorAll('.series-field').forEach(f => f.style.display = 'none');
            document.querySelector('input[name="length"]').value = contentData.length;
        } else if (contentData.type === 'series') {
            document.querySelectorAll('.movie-field').forEach(f => f.style.display = 'none');
            document.querySelectorAll('.series-field').forEach(f => f.style.display = 'block');
            document.querySelector('input[name="seasons"]').value = contentData.getSeasons();
            document.querySelector('input[name="episodes"]').value = contentData.getEpisodes();
        }

         
        alert(`Auto-filled details for ${this.value}`);
    }
});
