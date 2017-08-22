/**
 * Created by sonste on 28.12.2016.
 */
class PlussubSubtitleSelectizeElement extends Polymer.mixinBehaviors([tms.MetaChannelBehavior, tms.ServiceChannelBehavior], Polymer.Element) {
    static get is() {
        return "subtitle-selectize";
    }

    async ready() {
        tms.ServiceChannelBehavior.ready.apply(this);
        tms.MetaChannelBehavior.ready.apply(this);

        this._metaWriteSubscribe({
            topic: "selected_movie.entry",
            callback: this.movieChanged.bind(this),
        });

        this._metaWriteSubscribe({
            topic: "selected_subtitle_language.entry",
            callback: this.languageChanged.bind(this),
        });

        this.serviceSubscribe({
            topic: srtPlayer.Descriptor.SERVICE.SUBTITLE_PROVIDER.PUB.SEARCH_RESULT,
            callback: this.updateSubtitles.bind(this)
        });

        super.ready();
    }

    static get properties() {
        return {
            currentSelected: {
                type: Object,
                value: () => Object.assign({}),
                observer: '_currentSelectedChanged'
            },
            _currentMovie: {
                type: Object,
                value: () => Object.assign({})
            },
            _currentLanguage: {
                type: Object,
                value: () => Object.assign({})
            }
        }
    }

    updateSubtitles(result){
        if(!Array.isArray(result)||result.length===0){
            this.$.subtitleSelection.clearOptions();
            return;
        }

        if(this.currentSelected
            && this.currentSelected.idSubtitleFile === result[0].idSubtitleFile
            && this.currentSelected.subtitleLanguage === result[0].subtitleLanguage) {
            return;
        }

        var _result = result.map(entry =>  Object.assign(entry, {valueField: JSON.stringify(entry)}));

        this.$.subtitleSelection.clearOptions();
        this.$.subtitleSelection.load(_result);
        this.$.subtitleSelection.addItem(_result[0].valueField);
    }

    _currentSelectedChanged (subtitle) {
        "use strict";
        if (!subtitle || Object.keys(subtitle).length===0) {
            // console.log("empty sub");
            return;
        }

        this.fire('refreshSubtitle',  {
            subtitle:subtitle,
            movie:this._currentMovie,
            type:"selection"
        });

        this.metaPublish({
            topic: 'last_selected.entry',
            data: {
                subtitle:subtitle,
                movie:this._currentMovie,
                type:"selection"
            }
        });
        //notify
        this.metaPublish({
            topic: 'selected_subtitle.entry',
            data: subtitle
        });
    }

    movieChanged(movieMeta) {
        this._currentMovie = movieMeta;
        this._refreshItems();
    }

    languageChanged(language) {
        this._currentLanguage = language;
        this._refreshItems();
    }

    //todo: if movie changed -> hit eject?
    _refreshItems () {


        this.debounce('_subtitle_refresh', () => {

            if (!this._currentLanguage
                || Object.keys(this._currentLanguage).length === 0
                || !this._currentMovie
                || Object.keys(this._currentMovie).length === 0) {

                // this.$.subtitleSelection.clearOptions();
                return;
            }


            this.servicePublish({
                topic: srtPlayer.Descriptor.SERVICE.SUBTITLE_PROVIDER.SUB.SEARCH,
                data: {
                    imdbid: this._currentMovie.imdbID,
                    iso639: this._currentLanguage.iso639
                }
            });

        }, 300);
    }

}

customElements.define(PlussubSubtitleSelectizeElement.is, PlussubSubtitleSelectizeElement);