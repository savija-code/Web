document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mainHeader = document.getElementById('main-header');

    // Toggle mobile navigation menu
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times'); // 'X' icon
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars'); // Hamburger icon
            }
        });

        // Close mobile menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    }

    // Add/remove 'scrolled' class to header for styling changes on scroll
    if (mainHeader) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        });
    }

    // වර්තමාන පිටුව Navigation Bar එකේ සලකුණු කිරීමට
    const currentPagePath = window.location.pathname;
    const navLinksList = document.querySelectorAll('#navbar .nav-links li a');

    navLinksList.forEach(link => {
        if (link.href.endsWith(currentPagePath)) {
            link.classList.add('active-page');
        }
        if (currentPagePath === '/' || currentPagePath.endsWith('/index.html')) {
            if (link.href.endsWith('/index.html') || link.href.endsWith('/')) {
                link.classList.add('active-page');
            }
        }
    });

    // NASA APOD API Integration (අලුතින් එකතු කරන කොටස)
    const nasaApiKey = 'yOJM4vcCiWmWRUMU94wMiQZNyrirdcSmAWhUJV64'; // <<< මෙතැනට ඔබේ NASA API Key එක දමන්න
    const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;
    const apodContainer = document.getElementById('apod-container');

    if (apodContainer) {
        apodContainer.innerHTML = '<p style="text-align: center; color: #ccc;">Loading NASA Astronomy Picture of the Day...</p>';

        fetch(nasaApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.media_type === 'image') {
                    apodContainer.innerHTML = `
                        <img src="${data.url}" alt="${data.title}">
                        <h3 id="apod-title">${data.title}</h3>
                        <p id="apod-explanation">${data.explanation}</p>
                    `;
                } else if (data.media_type === 'video') {
                    apodContainer.innerHTML = `
                        <iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>
                        <h3 id="apod-title">${data.title}</h3>
                        <p id="apod-explanation">${data.explanation}</p>
                        <p style="color: #aaa; font-size: 0.9em; text-align: center;">(This is a video, displayed via iframe. Original source: <a href="${data.url}" target="_blank" style="color: #ffa600; text-decoration: none;">NASA APOD</a>)</p>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching NASA APOD:', error);
                apodContainer.innerHTML = `
                    <p style="color: red; text-align: center;">Failed to load NASA APOD. Please try again later.</p>
                    <p style="color: #aaa; text-align: center; font-size: 0.8em;">(Error: ${error.message})</p>
                `;
            });
    }

    // NASA Image and Video Library API Integration
    const nasaSearchInput = document.getElementById('nasa-search-input');
    const nasaSearchButton = document.getElementById('nasa-search-button');
    const nasaLibraryResults = document.getElementById('nasa-library-results');
    const loadMoreButton = document.getElementById('load-more-button');

    let currentPage = 1;
    let currentSearchTerm = '';
    const itemsPerPage = 6; // එක් වරකට load වන items ගණන
    const defaultSearchTerm = 'galaxy,nebula,black hole,telescope,planet';

    async function fetchNASALibrary(searchTerm, page = 1, append = false) {
        if (!nasaLibraryResults) return;

        if (!append) {
            nasaLibraryResults.innerHTML = '<p class="loading-message">Loading amazing discoveries from NASA...</p>';
            loadMoreButton.style.display = 'none';
        }

        try {
            const response = await fetch(`https://images-api.nasa.gov/search?q=${searchTerm}&media_type=image,video&page=${page}&page_size=${itemsPerPage}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const items = data.collection.items;
            if (!items || items.length === 0) {
                nasaLibraryResults.innerHTML = '<p class="error-message">No results found for your search. Try a different keyword!</p>';
                loadMoreButton.style.display = 'none';
                return;
            }

            if (!append) {
                nasaLibraryResults.innerHTML = '';
            }

            items.forEach(item => {
                const title = item.data[0].title || 'No Title Available';
                const description = item.data[0].description || 'No description available.';
                const mediaType = item.data[0].media_type;
                const link = item.links && item.links[0] ? item.links[0].href : '';

                let mediaContent = '';
                if (mediaType === 'image' && link) {
                    mediaContent = `<img src="${link}" alt="${title}">`;
                } else if (mediaType === 'video' && item.href) { // Use item.href for collection link for videos
                    mediaContent = `
                        <p style="text-align: center;"><i class="fas fa-video fa-3x" style="color: #00fdfd; margin-bottom: 10px;"></i></p>
                        <p style="text-align: center; font-style: italic;">(Video - Click to view on NASA)</p>
                        <a href="${item.href}" target="_blank" class="learn-more">Watch Video</a>
                    `;
                } else {
                    mediaContent = `<p style="text-align: center; color: #aaa;"><i class="fas fa-ban fa-2x"></i> No direct media preview</p>`;
                }

                const truncatedDescription = description.length > 150 ? description.substring(0, 150) + '...' : description;

                const itemHtml = `
                    <div class="nasa-item">
                        ${mediaContent}
                        <h3>${title}</h3>
                        <p>${truncatedDescription}</p>
                        <a href="${item.href}" target="_blank" class="learn-more">Learn More</a>
                    </div>
                `;
                nasaLibraryResults.insertAdjacentHTML('beforeend', itemHtml);
            });

            if (items.length === itemsPerPage) {
                loadMoreButton.style.display = 'block';
            } else {
                loadMoreButton.style.display = 'none';
            }
            currentPage++;
        } catch (error) {
            console.error('Error fetching NASA Image/Video Library data:', error);
            nasaLibraryResults.innerHTML = '<p class="error-message">Failed to load NASA content. Please try again later.</p>';
            loadMoreButton.style.display = 'none';
        }
    }

    if (nasaSearchButton) {
        nasaSearchButton.addEventListener('click', () => {
            const searchTerm = nasaSearchInput.value.trim();
            if (searchTerm) {
                currentSearchTerm = searchTerm;
                currentPage = 1;
                fetchNASALibrary(currentSearchTerm, currentPage, false);
            } else {
                currentSearchTerm = defaultSearchTerm;
                currentPage = 1;
                fetchNASALibrary(currentSearchTerm, currentPage, false);
            }
        });
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            fetchNASALibrary(currentSearchTerm, currentPage, true);
        });
    }

    if (nasaLibraryResults) {
        currentSearchTerm = defaultSearchTerm;
        fetchNASALibrary(currentSearchTerm, currentPage, false);
    }

    // GBIF Biodiversity API Integration
    const gbifSearchInput = document.getElementById('gbif-search-input');
    const gbifSearchButton = document.getElementById('gbif-search-button');
    const gbifResultsContainer = document.getElementById('gbif-results');
    const gbifLoadMoreButton = document.getElementById('gbif-load-more-button');

    let gbifCurrentOffset = 0;
    const gbifLimit = 20;
    let gbifCurrentSearchTerm = '';

    async function fetchGBIFData(searchTerm, offset = 0, append = false) {
        if (!gbifResultsContainer) return;

        if (!append) {
            gbifResultsContainer.innerHTML = '<p class="loading-message">Searching biodiversity data from GBIF...</p>';
            gbifLoadMoreButton.style.display = 'none';
        }

        const apiUrl = `https://api.gbif.org/v1/occurrence/search?q=${encodeURIComponent(searchTerm)}&limit=${gbifLimit}&offset=${offset}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const results = data.results;
            if (!results || results.length === 0) {
                if (!append) {
                    gbifResultsContainer.innerHTML = '<p class="error-message">No biodiversity records found for your search. Try a different keyword!</p>';
                } else {
                    gbifResultsContainer.insertAdjacentHTML('beforeend', '<p class="loading-message">No more results.</p>');
                }
                gbifLoadMoreButton.style.display = 'none';
                return;
            }

            if (!append) {
                gbifResultsContainer.innerHTML = '';
            }

            results.forEach(item => {
                const scientificName = item.scientificName || 'N/A';
                const commonName = item.vernacularName || item.acceptedScientificName || 'No common name available';
                const eventDate = item.eventDate ? new Date(item.eventDate).toLocaleDateString() : 'N/A';
                const country = item.country || 'N/A';
                const locality = item.locality || 'N/A';
                const datasetName = item.datasetName || 'Unknown Dataset';
                const imageUrl = item.media && item.media.length > 0 && item.media[0].identifier ? item.media[0].identifier : 'https://via.placeholder.com/300x200?text=No+Image';

                let description = `Observed in ${locality}, ${country}`;
                if (eventDate !== 'N/A') {
                    description += ` on ${eventDate}.`;
                }
                description += ` Dataset: ${datasetName}.`;

                const gbifItemHtml = `
                    <div class="gbif-item">
                        <img src="${imageUrl}" alt="${commonName || scientificName}">
                        <h3>${commonName}</h3>
                        <p><strong>Scientific Name:</strong> <em>${scientificName}</em></p>
                        <p>${description}</p>
                        <a href="https://www.gbif.org/occurrence/${item.key}" target="_blank" class="view-details">View Details on GBIF</a>
                    </div>
                `;
                gbifResultsContainer.insertAdjacentHTML('beforeend', gbifItemHtml);
            });

            if (data.endOfRecords === false && results.length === gbifLimit) {
                gbifLoadMoreButton.style.display = 'block';
                gbifCurrentOffset = offset + gbifLimit;
            } else {
                gbifLoadMoreButton.style.display = 'none';
            }

        } catch (error) {
            console.error('Error fetching GBIF data:', error);
            gbifResultsContainer.innerHTML = '<p class="error-message">Failed to load GBIF data. Please try again later.</p>';
            gbifLoadMoreButton.style.display = 'none';
        }
    }

    if (gbifSearchButton) {
        gbifSearchButton.addEventListener('click', () => {
            const searchTerm = gbifSearchInput.value.trim();
            if (searchTerm) {
                gbifCurrentSearchTerm = searchTerm;
                gbifCurrentOffset = 0;
                fetchGBIFData(gbifCurrentSearchTerm, gbifCurrentOffset, false);
            } else {
                gbifResultsContainer.innerHTML = '<p class="loading-message">Please enter a search term (e.g., "Panthera leo", "bird").</p>';
                gbifLoadMoreButton.style.display = 'none';
            }
        });
    }

    if (gbifLoadMoreButton) {
        gbifLoadMoreButton.addEventListener('click', () => {
            fetchGBIFData(gbifCurrentSearchTerm, gbifCurrentOffset, true);
        });
    }

    // "ඉහළට යන්න" බොත්තම සඳහා Smooth scroll - මෙය නිවැරදි ස්ථානයේ තබා ඇත.
    const goToTopBtn = document.querySelector('a[href="#main-header"]');
    if (goToTopBtn) {
        goToTopBtn.addEventListener('click', function(event) {
            event.preventDefault(); // පෙරනිමි හැසිරීම (එකවර උඩට පැනීම) නවත්වයි
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Email obfuscation
    var emailLink = document.getElementById('email-link');
    if (emailLink) {
        var user = 'savija.rumeth';
        var domain = 'gmail.com'; // ඔබේ සත්‍ය domain එක වෙනස් නම් මෙතන වෙනස් කරන්න
        emailLink.href = 'mailto:' + user + '@' + domain;
        emailLink.textContent = user + '@' + domain;
    }

    // Mobile Warning Message logic (මෙයද DOMContentLoaded තුලට ගෙන ඇත)
    function checkMobileAndShowWarning() {
        const mobileWarning = document.getElementById('mobileWarningMessage');
        if (mobileWarning) {
            const isMobileDevice = (
                window.innerWidth <= 768 ||
                /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            );
            if (isMobileDevice) {
                mobileWarning.style.display = 'block';
            } else {
                mobileWarning.style.display = 'none';
            }
        }
    }
    // Call the function when the DOM is fully loaded
    checkMobileAndShowWarning();
    // Call the function whenever the window is resized
    window.addEventListener('resize', checkMobileAndShowWarning);
    // If the page was loaded from cache (e.g., back button), ensure the check runs
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            checkMobileAndShowWarning();
        }
    });
});

// Splash Screen Logic (මෙය window 'load' event එකට අදාළ වන නිසා DOMContentLoaded වලින් පිටත තබා ඇත)
window.addEventListener('load', function() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        const splashDuration = 4000;
        const fadeOutDuration = 1000;

        setTimeout(function() {
            splashScreen.classList.add('fade-out');

            setTimeout(function() {
                splashScreen.style.display = 'none';
            }, fadeOutDuration);

        }, splashDuration);
    }
});