import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-xl px-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-sm">
          <div className="font-headline-md text-headline-md font-bold text-primary mb-sm">
            ViMeet
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Making remote collaboration feel truly connected.
          </p>
        </div>

        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">
            Product
          </h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Features
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Pricing
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Security
          </a>
        </div>

        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">
            Resources
          </h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Help Center
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            API Documentation
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Community
          </a>
        </div>

        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">
            Company
          </h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            About Us
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Careers
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
            Contact
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-sm">
        <p className="font-body-sm text-body-sm text-outline">
          © 2024 ViMeet Inc. All rights reserved.
        </p>
        <div className="flex gap-md font-body-sm text-body-sm text-outline">
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}