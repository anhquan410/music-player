const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "MY_PLAYER"

const cd = $('.cd');
const header = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const player = $('.player')
const playBtn = $('.btn.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const repeatBtn = $('.btn-repeat')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const playlist = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: "Bạn đời",
            singer: 'Karik ft GDucky',
            path: './music_audio/BanDoi.mp3',
            image: './img/BanDoi.jpg'
        },
        {
            name: "Chịu cách mình nói thua",
            singer: 'RHYDER',
            path: './music_audio/ChiuCachMinhNoiThua.mp3',
            image: './img/ChiuCachMinhNoiThua.jpg'
        },
        {
            name: "Đôi mươi",
            singer: 'Hoàng Dũng',
            path: './music_audio/DoiMuoi.mp3',
            image: './img/DoiMuoi.jpg'
        },
        {
            name: "Ném câu yêu vào không trung",
            singer: 'Hoàng Dũng',
            path: './music_audio/NemCauYeuVaoKhongTrung.mp3',
            image: './img/BanDoi.jpg'
        },
        {
            name: "Nép vào anh và nghe anh hát",
            singer: 'Hoàng Dũng',
            path: './music_audio/NepVaoAnhVaNgheAnhHat.mp3',
            image: './img/NepVaoAnhVaNgheAnhHat.jpg'
        },
        {
            name: "Bài này không để đi diễn",
            singer: 'Anh Tú Atus',
            path: './music_audio/BaiNayKhongDeDiDien.mp3',
            image: './img/BaiNayKhongDeDiDien.jpg'
        },
        {
            name: "Đi về nhà",
            singer: 'Đen Vâu ft Justatee',
            path: './music_audio/DiVeNha.mp3',
            image: './img/DiVeNha.jpg'
        },
    ],

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })

    },

    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay|dừng khi play|pause
        const cdThumAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        }
        )
        cdThumAnimate.pause()

        // Xử lý phóng to|thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lí khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi bài hát được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumAnimate.play()
        }
        // Khi bài hát bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumAnimate.pause()
        }
        /// Thanh tiến độ bài hát thay đổi khi play
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        // Khi tua bài hát 
        progress.onchange = function (e) {
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }

        // Khi repeat bài hát
        repeatBtn.onclick = function () {

            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Khi lùi lại bài trươc
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi chuyển bài kế tiếp
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()

            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi nghe ngẫu nhiên bài hát
        randomBtn.onclick = function () {

            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            // Xử lý khi click vào song || song's option
            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if (e.target.closest('.song:not(.active)')) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
                // Xử lý khi click vào song's option

            }
        }
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    },

    loadCurrentSong: function () {
        header.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },


    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()

    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }

        this.loadCurrentSong()
    },

    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })

        }, 100)
    },

    start: function () {
        // Gán cấu hình config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho Obj
        this.defineProperties()

        // Lắng nghe & xử lí các sự kiện (Dom Events)
        this.handleEvents()

        //Tải bài hát đầu tiên lên UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render Playlist
        this.render()
    }

}


app.start()