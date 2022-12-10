const TRANSITION_DURATION: number = 2000;
const CLASS_CLOSE_BUTTON: string = ".galleryCloseButton";
const CLASS_IMAGE_TITLE: string = ".galleryImageTitle";
const CLASS_LEFT_BUTTON: string = ".galleryLeftButton";
const CLASS_PRESENTER: string = ".galleryPresenter";
const CLASS_RIGHT_BUTTON: string = ".galleryRightButton";
const CLASS_THUMBNAIL_SELECTOR: string = ".galleryThumbnailSelector";
const CLASS_TRANSITION_PRESENTER: string = ".galleryTransitionPresenter";
const CLASS_STAGE: string = ".galleryStage";

/**
 * These should be set in the `gallery` container's `data-images` property as JSON.
 */
class GalleryImage {
    #pathRoot: string;
    #imageSource: string;
    #thumbnailSource: string;
    #title: string;

    /**
     * The root of both the image and thumbnail source. Optional.
     */
    public get PathRoot(): string {
        return this.#pathRoot;
    }

    public set PathRoot(value: string) {
        this.#pathRoot = value;
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
     * Returns the full source of the image, considering the {@link PathRoot}.
     */
    public get EffectiveImageSource(): string {
        return this.PathRoot.length === 0 ?
            this.ImageSource :
            new URL(this.ImageSource, this.PathRoot).toString();
    }

    /**
     * The source of the image thumbnail. Optional; {@link ImageSource} will be used if not provided.
     */
    public get ThumbnailSource(): string {
        return this.#thumbnailSource;
    }

    public set ThumbnailSource(value: string) {
        this.#thumbnailSource = value;
    }

    /**
     * Returns the full source of the thumbnail, considering the {@link PathRoot}.
     */
    public get EffectiveThumbnailSource(): string {
        return this.PathRoot.length === 0 ?
            this.ThumbnailSource :
            new URL(this.ThumbnailSource, this.PathRoot).toString();
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
class GalleryT {
    #closeButton: HTMLButtonElement;
    #closable: boolean;
    #closed: boolean;
    // #galleryId: string;
    #imageTitle: HTMLElement;
    #images: Array<GalleryImage>;
    #leftButton: HTMLButtonElement;
    #presenter: HTMLImageElement;
    #transitionPresenter: HTMLImageElement;
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
        this.#closable = closable;
        this.#closed = closed;

        // this.#galleryId = galleryId;
        var root = document.getElementById(galleryId);
        if (root! instanceof HTMLDivElement)
            throw new Error(`Invalid Gallery ID '${galleryId}'`);
        this.#root = root as HTMLDivElement;

        var thumbnailSelector = this.#root.querySelectorAll(CLASS_THUMBNAIL_SELECTOR);
        if (thumbnailSelector.length != 1)
            throw new Error("More than one thumbnail selector defined.");
        if (thumbnailSelector[0]! instanceof HTMLDivElement)
            throw new Error(`Unexpected type '${typeof thumbnailSelector[0]}' for thumbnail selector.`);
        this.#thumbnailSelector = thumbnailSelector[0] as HTMLDivElement;

        this.LoadImages();

        var stage = this.#root.querySelector(CLASS_STAGE);
        if (stage! instanceof HTMLDivElement)
            throw new Error(`Unexpected type '${typeof stage}' for stage.`);
        this.#stage = stage as HTMLDivElement;

        var closeButton = this.#stage.querySelector(CLASS_CLOSE_BUTTON);
        if (closeButton! instanceof HTMLButtonElement)
            throw new Error(`Unexpected type '${typeof closeButton}' for close button.`);
        this.#closeButton = closeButton as HTMLButtonElement;

        var leftButton = this.#stage.querySelector(CLASS_LEFT_BUTTON);
        if (leftButton! instanceof HTMLButtonElement)
            throw new Error(`Unexpected type '${typeof leftButton}' for left button.`);
        this.#leftButton = leftButton as HTMLButtonElement;

        var rightButton = this.#stage.querySelector(CLASS_RIGHT_BUTTON);
        if (rightButton! instanceof HTMLButtonElement)
            throw new Error(`Unexpected type '${typeof rightButton}' for right button.`);
        this.#rightButton = rightButton as HTMLButtonElement;

        var presenter = this.#stage.querySelector(CLASS_PRESENTER);
        if (presenter! instanceof HTMLImageElement)
            throw new Error(`Unexpected type '${typeof presenter}' for presenter.`);
        this.#presenter = presenter as HTMLImageElement;

        var transitionPresenter = this.#stage.querySelector(CLASS_TRANSITION_PRESENTER);
        if (transitionPresenter! instanceof HTMLImageElement)
            throw new Error(`Unexpected type '${typeof transitionPresenter}' for transition presenter.`);
        this.#transitionPresenter = transitionPresenter as HTMLImageElement;

        var imageTitle = this.#stage.querySelector(CLASS_IMAGE_TITLE);
        if (imageTitle! instanceof HTMLElement)
            throw new Error(`Unexpected type '${typeof imageTitle}' for image title.`);
        this.#imageTitle = imageTitle as HTMLElement;

        this.#closeButton.addEventListener("click", (_) => this.CloseStage());
        this.#leftButton.addEventListener("click", (_) => this.ShiftLeft());
        this.#rightButton.addEventListener("click", (_) => this.ShiftRight());
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
    get Closable(): boolean {
        return this.#closable;
    }

    set Closable(value: boolean) {
        this.#closable = value;
        if (!value) {
            this.Hide(this.#closeButton);
            this.OpenStage();
        }
        else
            this.Show(this.#closeButton);
    }

    /**
     * The currently selected image.
     */
    public get SelectedImage(): number {
        return this.#selectedImageIndex;
    }


    public set SelectedImage(value: number) {
        this.#selectedImageIndex = value;
        // TODO
    }

    /**
     * Hide an element
     * @param element Element to hide.
     */
    private Hide(element: HTMLElement) {
    }

    /**
     * Show an element.
     * @param element Element to show.
     */
    private Show(element: HTMLElement) {
    }

    /**
     * Hide the stage.
     */
    public CloseStage() { 
        this.Hide(this.#stage);
    }
    
    /**
     * Show the stage.
     */
    public OpenStage() {
        this.Show(this.#stage);
    }

    /**
     * Load images from DOM and build thumbnails.
     */
    public LoadImages() {
        var imagesJson = this.#root.dataset.images;
        if (imagesJson === undefined)
            throw new Error("No images defined.");
        var images = JSON.parse(imagesJson as string);
        if (images! instanceof Array<GalleryImage>)
            throw new Error("Improperly structured JSON for images.");
        this.#images = images as Array<GalleryImage>;

        this.#thumbnailSelector.innerHTML = "";

        for (let index = 0; index < this.#images.length; index++) {
            const image = this.#images[index];
            var img = document.createElement("img");
            img.src = image.EffectiveImageSource;
            img.alt = image.Title;
            img.addEventListener("click", (_) => this.SelectedImage = index);
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

new GalleryT("main");