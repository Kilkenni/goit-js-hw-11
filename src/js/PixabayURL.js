function sanitizeString(dirtyString) {
    return dirtyString.trim().replaceAll(/ +/g, '+');
    //some RegExp magic. While it's a homemade one, it should trim spaces at the ends and replace inner spaces with a '+'
    //RegEx *should* do this: search one or more [space] (note the 'Kleene plus') and replace. 
}

class PixabayURL {
    constructor(searchString , page, per_page) {
        this.key = "24889983-c5e39d0275da98cda54faa42b"; //твой уникальный ключ доступа к API.
        this.q = sanitizeString(searchString); //термин для поиска. То, что будет вводить пользователь.
        this.image_type = "photo"; //тип изображения
        this.orientation = "horizontal"; //ориентация фотографии
        this.safesearch = "true"; //фильтр по возрасту
        this.page = page; //current page
        this.per_page = per_page; //images per page
    }

    toString() {
        let asString = Object.keys(this).reduce((urlPart, urlCurrentParam) => {
            return urlPart + "&" + urlCurrentParam + "=" + this[urlCurrentParam];   
        }, "");

        asString = "https://pixabay.com/api/?" + asString.slice(1);

        return asString;
    }
};

exports.PixabayURL = PixabayURL;