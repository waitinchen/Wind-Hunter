export default function Home() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center space-y-6 p-8">
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    🌬️ 獵風男團
                </h1>
                <p className="text-2xl text-gray-700">
                    Wind Hunter WebGame
                </p>
                <p className="text-lg text-gray-600 max-w-2xl">
                    基於心風算法的互動式 WebGame
                </p>
                <div className="pt-8 space-y-4">
                    <div className="text-sm text-gray-500">
                        專案正在開發中...
                    </div>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="https://github.com/waitinchen/Wind-Hunter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            查看 GitHub
                        </a>
                    </div>
                </div>
            </div>
        </main>
    )
}
