//#region Constants
const CLASS_BUTTON_OVERLAY: string = "galleryButtonOverlay";
const CLASS_CLOSE_BUTTON: string = "galleryCloseButton";
const CLASS_DISPLAY_NONE: string = "galleryDisplayNone";
const CLASS_IMAGE_TITLE: string = "galleryImageTitle";
const CLASS_LEFT_BUTTON: string = "galleryLeftButton";
const CLASS_OPAQUE: string = "galleryOpaque";
const CLASS_PRESENTER: string = "galleryPresenter";
const CLASS_RIGHT_BUTTON: string = "galleryRightButton";
const CLASS_THUMBNAIL_SELECTOR: string = "galleryThumbnailSelector";
const CLASS_TRANSPARENT: string = "galleryTransparent";
const CLASS_STAGE: string = "galleryStage";
//#endregion Constants

/**
 * These should be set in the `gallery` container's `data-images` property as JSON.
 */
class GalleryImage {
    #imageSource: string;
    #thumbnailSource: string;
    #title: string;

    constructor(o: any) {
        this.#imageSource = o.ImageSource;
        this.#thumbnailSource = o.ThumbnailSource ?? "";
        this.#title = o.Title ?? "";
    }

    /**
     * The source of the image.
     */
    public get ImageSource(): string {
        return this.#imageSource
    }

    public set ImageSource(value: string) {
        this.#imageSource = value;
    }

    /**
     * The source of the thumbnail. Optional; {@link ImageSource} will be used if not provided.
     */
    public get ThumbnailSource(): string {
        return this.#thumbnailSource;
    }

    public set ThumbnailSource(value: string) {
        this.#thumbnailSource = value;
    }

    /**
     * The title of the image. Will also be used for alt text.
     */
    public get Title(): string {
        return this.#title;
    }

    public set Title(value: string) {
        this.#title = value;
    }
}

/**
 * An image gallery. What do you want?
 */
class Gallery {
    #buttonOverlay: HTMLDivElement;
    #closeButton: HTMLButtonElement;
    #closable: boolean;
    #closed: boolean;
    #imageTitle: HTMLElement;
    #images: Array<GalleryImage>;
    #leftButton: HTMLButtonElement;
    #presenter: HTMLImageElement;
    #rightButton: HTMLButtonElement;
    #root: HTMLDivElement;
    #selectedImageIndex: number = 0;
    #stage: HTMLDivElement;
    #thumbnailSelector: HTMLDivElement;

    /**
     * Create a new gallery (you don't need to keep this object in a variable).
     * @param galleryId The ID of the element to use for the gallery. 
     * @param closable If the gallery should be closable.
     * @param closed If the gallery should start closed.
     */
    constructor(galleryId: string, closable: boolean = true, closed: boolean = false) {
        var root = document.getElementById(galleryId);
        if (!(root instanceof HTMLDivElement))
            throw new Error(`Invalid Gallery ID '${galleryId}'`);
        this.#root = root as HTMLDivElement;

        var thumbnailSelector = this.#root.querySelectorAll(`.${CLASS_THUMBNAIL_SELECTOR}`);
        if (thumbnailSelector.length != 1)
            throw new Error("More than one thumbnail selector defined.");
        if (!(thumbnailSelector[0] instanceof HTMLDivElement))
            throw new Error(`Unexpected type '${typeof thumbnailSelector[0]}' for thumbnail selector.`);
        this.#thumbnailSelector = thumbnailSelector[0] as HTMLDivElement;

        this.LoadImages();

        var stage = this.#root.querySelector(`.${CLASS_STAGE}`);
        if (!(stage instanceof HTMLDivElement))
            throw new Error(`Unexpected type '${typeof stage}' for stage.`);
        this.#stage = stage as HTMLDivElement;

        var buttonOverlay = this.#stage.querySelector(`.${CLASS_BUTTON_OVERLAY}`);
        if (!(buttonOverlay instanceof HTMLDivElement))
            throw new Error(`Unexpected type '${typeof buttonOverlay}' for button overlay.`);
        this.#buttonOverlay = buttonOverlay as HTMLDivElement;

        var closeButton = this.#buttonOverlay.querySelector(`.${CLASS_CLOSE_BUTTON}`);
        if (!(closeButton instanceof HTMLButtonElement))
            throw new Error(`Unexpected type '${typeof closeButton}' for close button.`);
        this.#closeButton = closeButton as HTMLButtonElement;

        var leftButton = this.#buttonOverlay.querySelector(`.${CLASS_LEFT_BUTTON}`);
        if (!(leftButton instanceof HTMLButtonElement))
            throw new Error(`Unexpected type '${typeof leftButton}' for left button.`);
        this.#leftButton = leftButton as HTMLButtonElement;

        var rightButton = this.#buttonOverlay.querySelector(`.${CLASS_RIGHT_BUTTON}`);
        if (!(rightButton instanceof HTMLButtonElement))
            throw new Error(`Unexpected type '${typeof rightButton}' for right button.`);
        this.#rightButton = rightButton as HTMLButtonElement;

        var presenter = this.#stage.querySelector(`.${CLASS_PRESENTER}`);
        if (!(presenter instanceof HTMLImageElement))
            throw new Error(`Unexpected type '${typeof presenter}' for presenter.`);
        this.#presenter = presenter as HTMLImageElement;

        var imageTitle = this.#buttonOverlay.querySelector(`.${CLASS_IMAGE_TITLE}`);
        if (!(imageTitle instanceof HTMLElement))
            throw new Error(`Unexpected type '${typeof imageTitle}' for image title.`);
        this.#imageTitle = imageTitle as HTMLElement;

        this.#closeButton.addEventListener("click", (_) => this.Closed = true);
        this.#leftButton.addEventListener("click", (_) => this.ShiftLeft());
        this.#rightButton.addEventListener("click", (_) => this.ShiftRight());

        this.Closable = closable;
        this.SelectedImage = 0;        
        this.Closed = closed;

        // Hack to prevent the initial close animation from being visible.
        this.#stage.classList.remove(CLASS_DISPLAY_NONE);
        this.#stage.style.height = "100%";
    }

    /**
     * If the image can be shifted left.
     */
    public get CanShiftLeft(): boolean {
        return this.#selectedImageIndex > 0;
    }

    /**
     * If the image can be sifted right.
     */
    public get CanShiftRight(): boolean {
        return this.#selectedImageIndex < this.#images.length - 1;
    }

    /**
     * Is the image closable.
     */
    public get Closable(): boolean {
        return this.#closable;
    }

    public set Closable(value: boolean) {
        this.#closable = value;
        if (!value) {
            this.Hide(this.#closeButton);
            this.Closed = false;
        }
        else
            this.Show(this.#closeButton);
    }

    /**
     * If the stage is closed.
     */
    public get Closed(): boolean {
        return this.#closed;
    }

    public set Closed(value: boolean) {
        if (!this.Closable)
            throw new Error("Not closable.");
        this.#closed = value;
        if (value) {
            this.#buttonOverlay.classList.add(CLASS_TRANSPARENT);
            this.Hide(this.#buttonOverlay)
            this.Hide(this.#stage, true);
            this.HideSelectedThumbnail();
        }
        else
            this.Show(this.#stage, true, () => {
                this.Show(this.#buttonOverlay);
                setTimeout(() => this.#buttonOverlay.classList.remove(CLASS_TRANSPARENT));
            });
    }

    /**
     * The currently selected image.
     */
    public get SelectedImage(): number {
        return this.#selectedImageIndex;
    }

    public set SelectedImage(value: number) {
        if (value < 0 || value >= this.#images.length)
            throw new RangeError(`Invalid image index '${value}'.`);
        
        this.#selectedImageIndex = value;

        var selectedImage = this.#images[value];
        this.HideSelectedThumbnail();
        var selectedThumbnail = this.#thumbnailSelector.querySelectorAll("img")[value];
        selectedThumbnail.classList.add(CLASS_OPAQUE);
        selectedThumbnail.scrollIntoView({
            behavior: "auto",
            block: "nearest",
            inline: "start"
        });
        
        this.#presenter.src = selectedImage.ImageSource;
        this.#presenter.alt = selectedImage.Title ?? "";
        this.#imageTitle.innerHTML = selectedImage.Title ?? "";
        this.#leftButton.disabled = !this.CanShiftLeft;
        this.#rightButton.disabled = !this.CanShiftRight;
    }

    /**
     * Hide any selected thumbnails.
     */
    private HideSelectedThumbnail() {
        this.#thumbnailSelector.querySelectorAll(`img.${CLASS_OPAQUE}`).forEach((img: HTMLImageElement) => img.classList.remove(CLASS_OPAQUE));
    }

    /**
     * Hide an element
     * @param element Element to hide.
     * @param animate Should the transition be animated.
     */
    private Hide(element: HTMLElement, animate: boolean = false) {
        if (animate) {
            var height = element.scrollHeight;
            var transition = element.style.transition;
            element.style.transition = "";
            requestAnimationFrame(() => {
                element.style.height = height + "px";
                element.style.transition = transition;

                requestAnimationFrame(() => element.style.height = 0 + "px");
            });
            element.setAttribute("data-collapsed", "true");
        }
        else
            element.classList.add(CLASS_DISPLAY_NONE);
    }

    /**
     * Show an element.
     * @param element Element to show.
     * @param animate Should the transition be animated.
     * @param callback A function to be called after the animation completes.
     */
    private Show(element: HTMLElement, animate: boolean = false, callback: Function = null) {
        if (animate) {
            element.style.height = element.scrollHeight + "px";
            var transitionEndHandler = (_ : TransitionEvent) => {
                element.removeEventListener("transitionend", transitionEndHandler);
                element.style.height = null;
                if (callback)
                    callback();
            }
            element.addEventListener("transitionend", transitionEndHandler);
            element.setAttribute("data-collapsed", "false");
        }
        else
            element.classList.remove(CLASS_DISPLAY_NONE);
    }

    /**
     * Load images from DOM and build thumbnails.
     */
    public LoadImages() {
        var imagesJson = this.#root.dataset.images;
        if (imagesJson === undefined)
            throw new Error("No images defined.");
        this.#images = JSON.parse(imagesJson as string).Images.map((image: any) => new GalleryImage(image));
        
        this.#thumbnailSelector.innerHTML = "";

        for (let index = 0; index < this.#images.length; index++) {
            const image = this.#images[index];
            var img = document.createElement("img");
            img.src = image.ThumbnailSource ?? image.ImageSource;
            img.alt = image.Title;
            img.title = image.Title;
            img.tabIndex = index;
            img.addEventListener("click", () => {
                this.SelectedImage = index;
                if (this.Closed)
                    this.Closed = false;
            });
            this.#thumbnailSelector.appendChild(img);
        }
    }

    /**
     * Shift the selected image one to the left.
     */
    public ShiftLeft() {
        if (this.CanShiftLeft)
            this.SelectedImage--;
    }

    /**
     * Shift the selected image one to the right.
     */
    public ShiftRight() {
        if (this.CanShiftRight)
            this.SelectedImage++;
    }
}

function BootGallery()
{
    document.querySelectorAll(".gallery").forEach(g => {
        var gallery = g as HTMLDivElement;
        new Gallery(gallery.id, JSON.parse((gallery.dataset.closable as string)?.toLowerCase() ?? "false"), JSON.parse((gallery.dataset.closed as string)?.toLowerCase() ?? "false"));
    });
}

// window.boot.register("page-ready", () => {
//     BootGallery();
// });