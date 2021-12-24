import { __esModule } from "simplelightbox";

class Pagination { //singleton!
    currentSearchString;
    currentPage;
    perPage = 40;
    #foundEntries = 0;

    constructor(currentSearchString = "") {
        if (typeof Pagination.instance === 'object') {
            return Pagination.instance;
        }
        this.currentSearchString = currentSearchString;
        this.currentPage = 1;
        //this.perPage = 40;

        Pagination.instance = this;
        return Pagination.instance;
    }

    setEntries(foundEntries) {
        this.#foundEntries = foundEntries;
    }

    resetNewPage(searchString) {
        this.currentSearchString = searchString;
        this.currentPage = 1;
    }

    checkNewPage() {
        if (this.#foundEntries <= this.currentPage * this.perPage) {
            return false; //we're at the last page
            
        }
        else {
            return true; //we can do another page
        }
    }

    updateNewPage(searchString = this.currentSearchString) {
        if (searchString === this.currentSearchString) {
            if (!this.checkNewPage) {
                return this; //we're at the last page, early exit
            }
            this.currentPage += 1; //switch to new page if searchString is the same. This is default behaviour
            return this;
        }
        else {
            this.resetNewPage(searchString); //new search
            return this;
        }
    }
};

exports.Pagination = Pagination;