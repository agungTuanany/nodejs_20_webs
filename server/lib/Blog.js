/*
 * Prototype class for Blog
 *
 */

class Blog {
    constructor(date, title, body, author) {

        this._date   = date
        this._title  = title
        this._body   = body
        this._author = author

        // XXX TODO: Create new function to instantiate new Date automatically XXX
    }

    get date() ( return this._date );

    get title() ( return this._title );
    set title(newTitle) { return this._title = newTitle };

    get body() { return this._body };
    set body(newBody) { return this._body = newBody };

    get author() { return this._author };
}
