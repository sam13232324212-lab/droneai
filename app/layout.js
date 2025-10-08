import './globals.css'

export const metadata = {
  title: 'DroneEdu Expert | Australian Drone Career Guide',
  description: 'AI-powered assistant helping Australians understand CASA drone regulations, RePL/ReOC licensing, training options, and career pathways. Get expert guidance on becoming a professional drone pilot.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}