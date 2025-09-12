import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="text-2xl font-bold mb-4 block hover:text-orange-500 transition-colors">
              Tutors<span className="text-orange-500">Pool</span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting students worldwide with expert tutors for O Levels, IGCSE, and A Levels success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-gray-300 hover:text-white transition-colors">Find Tutors</Link></li>
              <li><Link to="/signup" className="text-gray-300 hover:text-white transition-colors">Become a Tutor</Link></li>
              <li><Link to="/#subjects" className="text-gray-300 hover:text-white transition-colors">Subjects</Link></li>
              <li><Link to="/#about" className="text-gray-300 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/#reviews" className="text-gray-300 hover:text-white transition-colors">Success Stories</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Safety</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-orange-500 mr-3" />
                <span className="text-gray-300">support@tutorspool.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-orange-500 mr-3" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-orange-500 mr-3" />
                <span className="text-gray-300">Global Platform</span>
              </div>
            </div>

            {/* App Download */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3">Download Our App</h5>
              <div className="space-y-2">
                <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors block w-full text-left">
                  📱 App Store
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors block w-full text-left">
                  🤖 Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 TutorsPool. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;