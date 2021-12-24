import './sass/main.scss';
const axios = require('axios').default;
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

//module for counting pages
const { Pagination } = require("./js/Pagination");
//module for forming correct PixabayURL
const { PixabayURL } = require("./js/PixabayURL");

const formSearchInput = document.querySelector(`#search-form > input`);
const formBtnSubmit = document.querySelector(`#search-form > button`);
const btnLoadNextPage = document.querySelector(".load-more");
const galleryElem = document.querySelector(".gallery");

formBtnSubmit.addEventListener("click", searchImages);
btnLoadNextPage.addEventListener("click", loadNextPage);

enableLoadMore(false);

const pageCounter = new Pagination();
const imageLightBox = new SimpleLightbox('.gallery a', {captionsData: `alt`, captionDelay:500, overlay:true});
//console.log(pageCounter);

function enableLoadMore(enable) {
    if (enable) {
        btnLoadNextPage.disabled = false;
        btnLoadNextPage.style.opacity = "1";
        btnLoadNextPage.style.visibility = "visible";
    }
    else {
        btnLoadNextPage.disabled = true;
        btnLoadNextPage.style.opacity = "0";
        btnLoadNextPage.style.visibility = "hidden";
    }
}

async function renderImages(PixabaySearchResults) {
    /* Accepts data.hits from Axios only! */
    /* single image format from Pixabay (only useful keys):
    {
	        "id": 195893,
	        "pageURL": "https://pixabay.com/en/blossom-bloom-flower-195893/",
	        "previewURL": "https://cdn.pixabay.com/photo/2013/10/15/09/12/flower-195893_150.jpg"
	        "previewWidth": 150,
	        "previewHeight": 84,
	        "webformatURL": "https://pixabay.com/get/35bbf209e13e39d2_640.jpg",
	        "webformatWidth": 640,
	        "webformatHeight": 360,
	        "largeImageURL": "https://pixabay.com/get/ed6a99fd0a76647_1280.jpg",
	        "fullHDURL": "https://pixabay.com/get/ed6a9369fd0a76647_1920.jpg",
	        "imageURL": "https://pixabay.com/get/ed6a9364a9fd0a76647.jpg",
	        "imageWidth": 4000,
	        "imageHeight": 2250,
	        "views": 7671,
	        "downloads": 6439,
	        "likes": 5,
	        "comments": 2,
	    } */
    
    const markup = PixabaySearchResults.reduce((currentMarkup, currentImage) => {
        const currentImageMarkup = ` <div class="photo-card">
                <a href="${currentImage.largeImageURL}">
                    <img src="${currentImage.webformatURL}" alt="tags: ${currentImage.tags}" loading="lazy" width="640" height="auto"/>
                </a>
                <div class="info">
                    <p class="info-item">
                    <b>Likes</b> ${currentImage.likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b> ${currentImage.views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b> ${currentImage.comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b> ${currentImage.downloads}
                    </p>
                </div>
            </div>`;
        
        return currentMarkup += currentImageMarkup;
    }, "");

    galleryElem.insertAdjacentHTML("beforeend", markup);
    imageLightBox.refresh(); //force update SimpleLightbox
}

async function searchImages(event) {
    event.preventDefault();
    enableLoadMore(false);
    pageCounter.resetNewPage(formSearchInput.value);

    const currentPixabayURL = new PixabayURL(pageCounter.currentSearchString, pageCounter.currentPage, pageCounter.perPage);

    //console.log(currentPixabayURL.toString());

    const AxiosSearchParams = {
        method: 'get',
        url: currentPixabayURL.toString(),
    };

    try { 
        const searchResult = await axios(AxiosSearchParams);
        if (searchResult.statusText != "OK") {
            throw console.error("BAD PIXABAY RESPONSE STATUS: " + searchResult.status);
        }
        //update number of found images to handle pages
        pageCounter.setEntries(searchResult.data.totalHits);

        //console.log(searchResult);

        if (searchResult.data.totalHits > 0) {
            Notiflix.Notify.success(`Hooray! We found ${searchResult.data.totalHits} images.`);
            galleryElem.innerHTML = ""; //reset gallery
            renderImages(searchResult.data.hits);

            enableLoadMore(true);
        }
        else {
            Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

async function loadNextPage(event) {
    enableLoadMore(false);

    if (!pageCounter.checkNewPage()) {
        //there is no more results, that's it
        Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
        return; //early exit
    }

    pageCounter.updateNewPage();
    const currentPixabayURL = new PixabayURL(pageCounter.currentSearchString, pageCounter.currentPage, pageCounter.perPage); //forming URL with next page in mind

    const AxiosSearchParams = {
        method: 'get',
        url: currentPixabayURL.toString(),
    };

    try { 
        const searchResult = await axios(AxiosSearchParams);
        if (searchResult.statusText != "OK") {
            throw console.error("BAD PIXABAY RESPONSE STATUS: " + searchResult.status);
        }
        //update number of found images to handle pages
        //pageCounter.setEntries(searchResult.data.totalHits);

        //console.log(searchResult);
        renderImages(searchResult.data.hits); //render new page
        enableLoadMore(true); //enable button
    }
    catch (error) {
        console.log(error.message);
    }

}