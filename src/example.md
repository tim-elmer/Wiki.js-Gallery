<!-- 
	IMPORTANT: You must add the following to the script and style sections of the page properties. WikiJS doesn't copy them if you copy the page.

	Script: `<script src="path/to/index.js"></script>`
	Style: `@import url(path/to/style.css);`
-->
<div class="gallery" id="mainGallery" data-closable="true" data-closed="false" data-images='{
    "Images": [
        {
            "ImageSource": "https://cdn.com/character.jpg",
            "Title": "My character",
            "ThumbnailSource": "https://cdn.com/thumb/character.jpg"
        },
        {
            "ImageSource": "/super-cool-action-scene.jpg"
        }
    ]  
    }'>
    <div class="galleryThumbnailSelector"></div>
    <div class="galleryStage galleryDisplayNone">
        <div class="galleryButtonOverlay">
            <button type="button" class="galleryCloseButton">&times;</button>
            <button type="button" class="galleryLeftButton">&lt;</button>
            <button type="button" class="galleryRightButton">&gt;</button>
            <figcaption class="galleryImageTitle"></figcaption>
        </div>
        <img class="galleryPresenter">
    </div>
</div>

Some content...
