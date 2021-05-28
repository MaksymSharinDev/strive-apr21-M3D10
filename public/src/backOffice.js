const pageData = {
    cardData: {NameInput: '', DescInput: '', CatInput: '', imageURL: '',},
    movies: [],
    imgToLoadBlob: ''
}

const api = {
    readToken:
        async () => {
            await fetch('api/login', {method: 'POST'})
                .then(r => r.json())
                .then(data => pageData.access_token = data.access_token)
        },
    createMovie:
        async () => {
            await fetch('api/movie/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "access_token": pageData.cardData.access_token,
                    "name": pageData.cardData.NameInput,
                    "description": pageData.cardData.DescInput,
                    "category": pageData.cardData.CatInput,
                    "imageUrl": pageData.cardData.imageURL,
                })
            }).then(r => r.json()).then(data => pageData.movies.push(data))
        },
    removeMovie: () => {
    },
    editMovie: () => {
    },
    fetchCardData: (id) => {
    },
    fetchCategoryList : async () => {
        await fetch(`api/movie/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_token: pageData['access_token']
            })
        }).then(r => r.json()).then(data => pageData.categories = data)
    },
    fetchCardDataAll: async () => {
        await api.fetchCategoryList()
        for( let category of pageData.categories ){
            await fetch(`api/movie/category/${category}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: pageData['access_token']
                })
            }).then(r => r.json()).then(data => pageData.movies = [...pageData.movies,...data] )
        }

    },

    uploadImage: async (blob) =>
        await fetch('api/imageUpload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_token: pageData['access_token'],
                "blob": blob
            })
        }).then(r => r.json()).then(data => data)
}

const dom = {
    loadCardIntoDom: (target) => {
        target.outerHTML = tmpl('crudCardTemplate', pageData )
    },
}

window.onload = () => {

    ;(async function main() {
        try {
            await api.readToken()
            await api.fetchCardDataAll()
            //for (let cardData of deck) {
            dom.loadCardIntoDom( $('#deckHook')[0] )
            //}


        } catch (e) {
            console.log(e)
        }
    })().then()
}

document.addEventListener('dragover', e => e.preventDefault())
const imgUploadWrapper = $('#addCard .img-upload-wrapper')[0]
const ImageSlot = $('#addCard .card-img-top')[0]
const imageIcon = $('#addCard .card-img-top i')[0]

const ImageUrlForm = $('#addCard .card-img-top .form-div')[0]
const imageURLInput = $('#imageURL')[0]

const isImageUrl = url => !!url.match(/^http.+(png|jpeg|gif|jpg)$/g)
const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        }
    });
}

imgUploadWrapper.addEventListener('mouseover', () => {
    imgUploadWrapper.classList.add('active')
    imageIcon.classList.add('hover')
    ImageUrlForm.classList.remove('collapse')
})
imgUploadWrapper.addEventListener('mouseout', () => {
    imgUploadWrapper.classList.remove('active')
    imageIcon.classList.remove('hover')
    ImageUrlForm.classList.add('collapse')
})

imgUploadWrapper.addEventListener('dragover', e => e.currentTarget.style.cursor = 'copy')
imgUploadWrapper.addEventListener('drop', e => {
    e.preventDefault()
    let files = e.dataTransfer.items;
    if (files) {
        for (let i = 0; i < files.length; i++) {
            let isImage = files[i].type.match('^image/')
            isImage ? (() => {
                let file = files[i].getAsFile();
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    pageData.imgToLoadBlob = reader.result;
                    ImageSlot.style.background = `url(${reader.result})`
                    ImageSlot.style.backgroundSize = 'cover'
                })
                file ? reader.readAsDataURL(file) : null
            })() : null
        }
    }
})

imageURLInput.addEventListener('input', e => {
    isImageUrl(e.currentTarget.value) ?
        (async () => {
            pageData.imgToLoadBlob = await getBase64FromUrl(e.currentTarget.value)
            ImageSlot.style.background = `url(${pageData.imgToLoadBlob})`
            ImageSlot.style.backgroundSize = 'cover';
        })()
        : null
})


let addCardForm = $('form#addCard')[0]

addCardForm.addEventListener('submit', async e => {
    e.preventDefault()
    let inputs = [...e.currentTarget.querySelectorAll('input')]
    for (let input of inputs) {
        pageData.cardData[input.id.replace('film', '').replace('input')] = input.value

    }
    pageData.cardData.imageURL = (await api.uploadImage(pageData.imgToLoadBlob) ).display_url
    await api.createMovie()
})

