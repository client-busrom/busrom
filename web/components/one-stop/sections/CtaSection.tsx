"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, ChevronDown, Check } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface CtaSectionProps {
  title?: string
  subtitle?: string
  image?: any
  formConfig?: any
}

/**
 * Premium Custom Dropdown Component
 * Enhanced with data-lenis-prevent and event propagation fixes for smooth scrolling compatibility.
 */
function CustomDropdown({ label, options, placeholder, value, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fix Lenis scroll conflict
  useEffect(() => {
    const el = listRef.current;
    if (!el || !isOpen) return;

    const stopPropagation = (e: any) => e.stopPropagation();
    
    el.addEventListener('wheel', stopPropagation, { passive: false });
    el.addEventListener('touchmove', stopPropagation, { passive: false });
    
    return () => {
      el.removeEventListener('wheel', stopPropagation);
      el.removeEventListener('touchmove', stopPropagation);
    };
  }, [isOpen]);

  const selectedOption = options?.find((opt: any) => opt.value === value)

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-white text-[23px] font-semibold">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[63px] bg-black/40 border ${isOpen ? 'border-[#FFF28E]/60 shadow-[0_0_15px_rgba(255,242,142,0.2)]' : 'border-white/20'} rounded-[15px] px-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-black/50`}
      >
        <span className={`text-[22px] ${selectedOption ? 'text-white' : 'text-white/40'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
           animate={{ rotate: isOpen ? 180 : 0 }}
           transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-2 bg-[#2D2D1F] border border-white/10 rounded-[15px] shadow-2xl z-[500] overflow-hidden backdrop-blur-xl"
          >
            {/* data-lenis-prevent added to allow internal scrolling */}
            <div 
              ref={listRef}
              data-lenis-prevent
              className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar"
            >
              {options?.map((opt: any) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-white/5 ${value === opt.value ? 'bg-white/10 text-[#FFF28E]' : 'text-white/80'}`}
                >
                  <span className="text-[20px] font-medium">{opt.label}</span>
                  {value === opt.value && <Check className="w-5 h-5 text-[#FFF28E]" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * CtaSection (Contact Form)
 * Refined with Double-Layer Ghosting Effect and Lenis-compatible Dropdown.
 */
export function CtaSection({ title, subtitle, image, formConfig }: CtaSectionProps) {
  const SECTION_HEIGHT = 922
  const IMAGE_HEIGHT = 800
  const IMAGE_WIDTH = 584.5
  const BG_TOP_OFFSET_SCALED = 180

  const [formState, setFormState] = useState<any>({
    'project-type': '',
    'primary-requirement': ''
  })

  const fields = formConfig?.fields || []
  const getField = (name: string) => fields.find((f: any) => f.fieldName === name)

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center bg-transparent z-10"
      style={{ height: `${SECTION_HEIGHT}px` }}
    >
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* 1. Green Base Background */}
      <div 
        className="absolute inset-x-0 bottom-0 bg-[#5E571F] z-0" 
        style={{ top: `${BG_TOP_OFFSET_SCALED}px` }} 
      />

      {/* 2. Visual Layer: Double-Layer Images (Solid Foreground + Transparent Ghost) */}
      <div 
        className="absolute right-0 bottom-0 z-10 pointer-events-none"
        style={{ 
           width: `${IMAGE_WIDTH}px`,
           height: `${IMAGE_HEIGHT}px`
        }}
      >
         {image && (
           <div className="relative w-full h-full overflow-visible">
              {/* BACK LAYER (GHOST): 
                  Must be visible and offset left/up. 
                  Removed overflow-hidden from container to avoid clipping the ghost. 
              */}
              <motion.div 
                initial={{ opacity: 0, x: 0, y: 0 }}
                whileInView={{ opacity: 0.25, x: -100, y: -100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <OptimizedImage 
                  image={image} 
                  alt="Ghost Layer" 
                  className="w-full h-full object-cover"
                  size="large"
                />
              </motion.div>

              {/* FRONT LAYER (SOLID): Flush Bottom-Right */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-0 z-10"
              >
                <OptimizedImage 
                  image={image} 
                  alt="Solid Layer" 
                  className="w-full h-full object-cover"
                  size="large"
                />
              </motion.div>
           </div>
         )}
      </div>

      {/* 3. Scaled Content Container (Form Area) */}
      <div 
        className="relative z-20 flex-shrink-0 origin-top flex items-start overflow-visible"
        style={{ 
          width: `1920px`, 
          height: `1357px`, 
          transform: `scale(0.7)`,
        }}
      >
        <div className="pl-[153px] w-[1100px] pt-[380px]">
           <div className="mb-10">
              <h2 className="text-[60px] font-extrabold text-[#FFF28E] leading-[1.1] mb-6 uppercase tracking-tighter" style={{ fontFamily: "var(--font-anaheim)" }}>
                {title || "Get A Complete Solution"}
              </h2>
              <p className="text-[24px] font-semibold text-white/90 leading-[41px] max-w-[823px]" style={{ fontFamily: "var(--font-anaheim)" }}>
                {subtitle || "Looking for a One-stop Shopping for a Complete Set of Engineering Hardware? Any Size, Any Project - Get Your Custom Plan Quote in 24h."}
              </p>
           </div>

           <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-[773px] relative">
              <input 
                type="text" 
                placeholder={getField('name')?.placeholder || "Your Name"} 
                className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40" 
              />
              <input 
                type="text" 
                placeholder={getField('company')?.placeholder || "Your Company / Your Team"} 
                className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40" 
              />

              <input 
                type="email" 
                placeholder={getField('email')?.placeholder || "Your Email"} 
                className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40" 
              />
              <input 
                type="text" 
                placeholder={getField('whatsapp')?.placeholder || "Your Whatsapp"} 
                className="h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40" 
              />

              <div className="relative z-[502]">
                <CustomDropdown 
                  label={getField('project-type')?.label || "Project Type"}
                  placeholder={getField('project-type')?.placeholder || "Select Project Type"}
                  options={getField('project-type')?.options}
                  value={formState['project-type']}
                  onChange={(val: string) => setFormState({...formState, 'project-type': val})}
                />
              </div>
              <div className="relative z-[501]">
                <CustomDropdown 
                  label={getField('primary-requirement')?.label || "Primary Requirement"}
                  placeholder={getField('primary-requirement')?.placeholder || "Select Requirement"}
                  options={getField('primary-requirement')?.options}
                  value={formState['primary-requirement']}
                  onChange={(val: string) => setFormState({...formState, 'primary-requirement': val})}
                />
              </div>

              <div />
              <input 
                 type="text" 
                 placeholder={getField('other-primary-requirement')?.placeholder || "Please Enter..."}
                 className="w-full h-[63px] bg-black/30 border border-white/20 rounded-[15px] px-6 text-white text-[20px] focus:border-[#FFF28E] transition-all placeholder:text-white/40"
              />

              <div className="col-span-2">
                 <textarea 
                    placeholder={getField('specific-requirements-project-description')?.placeholder || "Specific Requirements / Project Description"} 
                    className="w-full h-[150px] bg-black/30 border border-white/20 rounded-[15px] p-6 text-white text-[20px] focus:border-[#FFF28E] resize-none placeholder:text-white/40" 
                 />
              </div>
           </div>

           <div className="mt-10 flex items-center gap-14">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-[419px] h-[83px] bg-[#B2A224] text-white text-[40px] font-black rounded-[63px] shadow-2xl transition-all"
                style={{ fontFamily: "var(--font-anaheim)" }}
              >
                {formConfig?.submitButtonText || "Send Inquiry"}
              </motion.button>
              <button className="flex items-center gap-4 text-white hover:text-[#FFF28E] transition-colors">
                 <Upload className="w-8 h-8" />
                 <span className="text-[20px] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-anaheim)" }}>
                    {getField('file')?.label || "Upload File"}
                 </span>
              </button>
           </div>
        </div>
      </div>
    </section>
  )
}
