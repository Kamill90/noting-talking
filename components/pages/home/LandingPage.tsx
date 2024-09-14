import LandingHeader from '../../ui/LandingHeader'

export default function LandingPage() {
    return (
        <div>
            <LandingHeader />
            <section id="features" className="py-20 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center">Features</h2>
                    <p className="mt-4 text-center text-lg text-gray-600">
                        Discover the amazing features of NotesGPT.
                    </p>
                    {/* Add more content here */}
                </div>
            </section>
            <section id="how-it-works" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center">How Does It Work</h2>
                    <p className="mt-4 text-center text-lg text-gray-600">
                        Learn how NotesGPT can help you create content with your voice.
                    </p>
                    {/* Add more content here */}
                </div>
            </section>
            <section id="pricing" className="py-20 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center">Pricing</h2>
                    <p className="mt-4 text-center text-lg text-gray-600">
                        Choose the plan that suits you best.
                    </p>
                    {/* Add more content here */}
                </div>
            </section>
        </div>
    )
}