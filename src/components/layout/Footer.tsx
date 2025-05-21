import React from 'react';
import Link from 'next/link';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-8 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nigerian British University</h3>
            <p className="text-gray-300">
              A premier institution dedicated to academic excellence and research innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="https://nbu.edu.ng/about/" className="text-gray-300 hover:text-white">
                  About NBU
                </Link>
              </li>
              <li>
                <Link href="https://nbu.edu.ng/contact/" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary-300" />
                <span>Nigerian British University<br />Kilometre 10 Port Harcourt <br/>/Aba Expressway Asa, <br /> Abia State, Nigeria</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-2 text-primary-300" />
                <span>info@nbu.edu.ng</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-2 text-primary-300" />
                <span>+234 123 456 7890</span>
              </div>
            </address>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram className="text-2xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} Nigerian British University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
