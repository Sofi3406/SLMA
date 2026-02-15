import Link from 'next/link'
import { FaHeart, FaBook, FaPray, FaHandsHelping, FaUsers, FaClock, FaStar, FaCheckCircle } from 'react-icons/fa'

const volunteerOpportunities = [
  {
    id: 'health',
    title: 'Health & Medical Outreach',
    description: 'Assist in community health camps, medical awareness programs, and SLMA health tech deployment in mosques and schools.',
    icon: FaHeart,
    color: 'from-emerald-500 to-teal-500',
    stats: '50+ events organized'
  },
  {
    id: 'education',
    title: 'Educational Programs',
    description: 'Support after-school Quranic studies, STEM workshops, and digital literacy training for youth in our communities.',
    icon: FaBook,
    color: 'from-blue-600 to-indigo-600',
    stats: '200+ students reached'
  },
  {
    id: 'religious',
    title: 'Islamic Community Service',
    description: 'Help organize Ramadan relief, mosque cleanups, Islamic lectures, and youth mentorship programs.',
    icon: FaPray,
    color: 'from-amber-500 to-orange-500',
    stats: '15+ mosques partnered'
  },
  {
    id: 'community',
    title: 'General Community Development',
    description: 'Event coordination, social media, graphic design, and community engagement activities.',
    icon: FaHandsHelping,
    color: 'from-violet-600 to-purple-600',
    stats: '100+ volunteers needed'
  }
]

const currentVolunteers = [
  {
    name: 'Abdul Hafiz Jemal',
    role: 'Health Coordinator',
    joined: 'Jan 2026',
    hours: '45 hrs',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    name: 'Seada Jemal',
    role: 'Education Lead',
    joined: 'Dec 2025',
    hours: '62 hrs',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    name: 'Mujib Sultan',
    role: 'Ramadan Relief',
    joined: 'Feb 2026',
    hours: '28 hrs',
    color: 'from-amber-400 to-orange-500'
  }
]

export default function VolunteerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30">
      {/* Hero Section */}
     

      <div className="container mx-auto px-4 py-20">
        {/* Opportunities Grid */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full mb-6">
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Volunteer Opportunities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text">Passion</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose where your skills can make the greatest impact in our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {volunteerOpportunities.map((opportunity) => {
              const Icon = opportunity.icon
              return (
                <div
                  key={opportunity.id}
                  className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 h-full overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${opportunity.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Corner Accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${opportunity.color} opacity-10 rounded-bl-3xl`} />
                  
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${opportunity.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="relative text-2xl font-bold text-gray-900 mb-4">
                    {opportunity.title}
                  </h3>
                  <p className="relative text-gray-600 mb-6 leading-relaxed">{opportunity.description}</p>
                  <div className="relative flex items-center justify-between">
                    <div className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-white border border-gray-200 text-gray-700">
                      {opportunity.stats}
                    </div>
                    <Link
                      href="/auth/register"
                      className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all duration-300"
                    >
              
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Current Volunteers */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-6">
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Meet Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-transparent bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text">Amazing</span> Volunteers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {currentVolunteers.map((volunteer, index) => (
              <div key={index} className="group relative bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-gray-100 to-white rounded-full border border-gray-200 text-sm font-semibold text-gray-700">
                    Active Volunteer
                  </div>
                </div>
                
                <div className={`w-24 h-24 bg-gradient-to-br ${volunteer.color} rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                  {volunteer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{volunteer.name}</h3>
                <p className="text-gray-600 font-semibold mb-4 flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-emerald-500" />
                  {volunteer.role}
                </p>
                <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Joined</span>
                    <span className="font-semibold text-gray-800">{volunteer.joined}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Service Hours</span>
                    <span className="font-bold text-blue-600">{volunteer.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center">
          {/* Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-emerald-900" />
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
          
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                Ready to Make a Difference?
              </span>
            </h2>
            
            <p className="text-xl mb-12 text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Join hundreds of post-Hayrenzi students in transforming our communities. 
              Your time, skills, and passion can create lasting impact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <Link
                href="/donate"
                className="group relative px-12 py-4 bg-gradient-to-r from-white to-cyan-50 text-gray-900 text-lg font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-3">
                  Start Volunteering Now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              
              
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-lg text-white/90 italic">
                "The best among you are those who bring greatest benefit to many others."
              </p>
              <p className="mt-2 text-white/70">
                <span className="font-semibold">– SLMA Volunteer Motto</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}