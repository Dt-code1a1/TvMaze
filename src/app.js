import {mapListToDOMElements, createDOMElem} from './dominteractions.js'
import {getShowsByKey, getShowById} from './requests.js'

class TvMaze{
    constructor(){
        this.viewElems = {}
        this.showNameButtons = {}
        this.selectedName = "harry"
        this.favoriteShow = []
        this.initializeApp()

    }

    initializeApp = () => {
        this.connectDOMElements()
        this.setupListeners()
        this.FavoriteList()

    }

    connectDOMElements = () => {
        const listOfIds = Array.from(document.querySelectorAll("[id]")).map(elem => elem.id)
        const listOfShowNames = Array.from(document.querySelectorAll("[data-show-name]")).map(elem => elem.dataset.showName)

        this.viewElems = mapListToDOMElements(listOfIds, "id")
        this.showNameButtons = mapListToDOMElements(listOfShowNames, "data-show-name")
    }

    setupListeners = () => {
        Object.keys(this.showNameButtons).forEach(showName => {
            this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter)
        })
        this.viewElems.keyWordsForm.addEventListener('submit',(event) => {
            event.preventDefault()
            this.fetchAndDisplayShowsFromInput()
        })
    }

    setCurrentNameFilter = () => {
        this.selectedName = event.target.dataset.showName
        this.fetchAndDisplayShows()
    }

    fetchAndDisplayShows = () => {
        getShowsByKey(this.selectedName).then(shows => this.renderCard(shows))
    }
    fetchAndDisplayShowsFromInput = () => {
        this.selectedName = this.viewElems.keyWordsForm.keyWord.value
        getShowsByKey(this.selectedName).then(shows => this.renderCard(shows))
    }

    renderCard = shows => {
        Array.from(document.querySelectorAll("[data-show-id]")).forEach(btn => btn.removeEventListener('click', this.openDetailsView))
        this.viewElems.showsWrapper.innerHTML = ""

        for(const { show } of shows){
            this.createShowCard(show)
            const card = this.createShowCard(show)
            this.viewElems.showsWrapper.appendChild(card)
        }
    }

    closeDetailsView = event => {
        const { showId } = event.target.dataset
        this.viewElems.body.style.overflow = "scroll"
        this.viewElems.body.style.overflowX = "hidden"
        const closeBtn = document.querySelector(`[id="showPreview"] [data-show-id="${showId}"]`)
        closeBtn.removeEventListener('click', this.closeDetailsView);
        this.viewElems.showPreview.innerHTML = ""
        this.viewElems.showPreview.style.display = "none"
    }

    openDetailsView = event => {
        const { showId } = event.target.dataset
        this.viewElems.body.style.overflowY = "hidden"
        getShowById(showId).then(show => {
            const card = this.createShowCard(show, true, false)
            this.viewElems.showPreview.appendChild(card)
            this.viewElems.showPreview.style.display = "block"
        })
    }
    
    FavoriteList = () => {
        if(localStorage.getItem("favList")){
            this.favoriteShow = localStorage.getItem('favList')
            this.favoriteShow = JSON.parse(this.favoriteShow)
        }else{
            this.favoriteShow = []
        }
        this.renderFavoriteList()
    }

    deleteShow = (event) => {
        for( const elem of this.favoriteShow){
            if(elem.show == event.target.dataset.showFavId){
                elem.isRemove = true
            }
        }
        localStorage.setItem('favList', JSON.stringify(this.favoriteShow))
        this.renderFavoriteList()
        }

    renderFavoriteList = () => {
        this.favoriteShow = this.favoriteShow.filter((show)=>{if(show.isRemove === false){return show} })
        this.viewElems.showsFavorites.innerHTML = ""

        for(const show of this.favoriteShow){
            getShowById(show.show).then(show => {
                const card = this.createShowCard(show, false, true)
                this.viewElems.showsFavorites.appendChild(card)
            }) 
        }  
    }

    favoriteAdd = event => {
        const { showFavId } = event.target.dataset
        let Elem = {
            show: showFavId,
            isRemove: false
        }
        this.favoriteShow.push(Elem)
        localStorage.setItem('favList', JSON.stringify(this.favoriteShow))
        this.renderFavoriteList()
    }

    createShowCard = (show, isDetailed, isFavorite) => {
        const divCard = createDOMElem('div', 'card', null, null)
        const divCardBody = createDOMElem('div', 'card-body')
        const h5 = createDOMElem('h5', 'card-title', show.name)
        const h1 = createDOMElem('h1', 'card-title', show.name)
        let fav = createDOMElem('button', 'favourite_btn')
        const language = createDOMElem('p',"card-text",`Language: ${show.language}`)
        const status = createDOMElem('p',"card-text",`Status: ${show.status}`)
        const premiered = createDOMElem('p',"card-text",`Premiered: ${show.premiered}`)
        let img,p,btn,img2

        if(show.image){
            if(isDetailed){
                img = createDOMElem('div', 'card-preview-bg img',)
                img.style.backgroundImage = `url('${show.image.original}')`
                
            }else{
                img = createDOMElem('img', 'card-img-top img', null, show.image.medium)    
            }

        }else{
            img = createDOMElem('img', 'card-img-top img', null, 'https://via.placeholder.com/210x295')
        }

        if(isDetailed){
            btn = createDOMElem('button', 'btn btn-primary btn__close', 'Hide details')
        }else{
            btn = createDOMElem('button', 'btn btn-primary btn-show', 'Show details')
        }

        if(show.summary){
            if (isDetailed) {
                p = createDOMElem('p', 'card-text', `Description:  ${show.summary}`)
            }else{
                p = createDOMElem('p', 'card-text', `${show.summary.slice(0,80)}...`)
            }
            
        }else{
            p = createDOMElem('p', 'card-text', 'Description: There is no summary for that show yet.')
        }
        
        btn.dataset.showId = show.id;

        if (isDetailed) {
          btn.addEventListener('click', this.closeDetailsView);
          fav.classList.add("hidden")
        } else {
          btn.addEventListener('click', this.openDetailsView);
          fav.classList.remove("hidden")
        }
        
        if(isFavorite){
            img2 = createDOMElem('img', 'favorite_icon', null, "/imgs/minus.png")
            img2.dataset.showFavId = show.id
            fav.addEventListener('click', this.deleteShow)
        }else{
            img2 = createDOMElem('img', 'favorite_icon', null, "/imgs/plus.png")
            img2.dataset.showFavId = show.id
            fav.addEventListener('click', this.favoriteAdd)
        }

        if(isDetailed){
            divCard.appendChild(divCardBody)
            divCardBody.appendChild(h1)
            divCardBody.appendChild(p)
            divCardBody.appendChild(language)
            divCardBody.appendChild(status)
            divCardBody.appendChild(premiered)
            divCardBody.appendChild(img)
            divCardBody.appendChild(btn)
        }else{
            divCard.appendChild(divCardBody)
            divCard.appendChild(fav)
            divCardBody.appendChild(img)
            divCardBody.appendChild(h5)
            divCardBody.appendChild(p)
            divCardBody.appendChild(btn)
            fav.appendChild(img2)
        }
        return divCard
    }

}
document.addEventListener('DOMContentLoaded', new TvMaze())
