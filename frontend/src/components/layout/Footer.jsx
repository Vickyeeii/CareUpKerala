import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">CareUp</h3>
            <p className="text-sm text-muted">
              Trusted home care services in Kerala. We treat your family like our own.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-primary">Company</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
              <li><Link to="/services" className="hover:text-accent">Services</Link></li>
              <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-accent">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-primary">Social</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Twitter</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted">
          © {new Date().getFullYear()} CareUp Kerala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
