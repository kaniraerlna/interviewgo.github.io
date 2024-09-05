import { useMotionValue, motion, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState} from "react";
import { FiArrowRight } from "react-icons/fi";
import Image1 from '../assets/image/image1.jpg';
import akuntansi from '../assets/image/akuntansi.jpg';
import designgrafis from '../assets/image/designgrafis.jpg';
import hiburan from '../assets/image/hiburan.jpg';
import it from '../assets/image/it.jpg';
import keamanan from '../assets/image/keamanan.jpg';
import kesehatan from '../assets/image/kesehatan.jpg';
import kuliner from '../assets/image/kuliner.jpg';
import latarbelakanguser from '../assets/image/latarbelakanguser.jpg';
import layananpelanggan from '../assets/image/layananpelanggan.jpg';
import pemasaran from '../assets/image/pemasaran.jpg';
import pendidikan from '../assets/image/pendidikan.jpg';
import perhotelan from '../assets/image/perhotelan.jpg';
import posisi from '../assets/image/posisi.jpg';
import softskill from '../assets/image/softskill.jpg';

const Features = () => {
  return (
    <section className="min-h-screen bg-customBiru4 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          heading="General - Perusahaan"
          subheading="Learn what we do here"
          imgSrc={Image1}
          code={0}
        />
        <Link
          heading="General - Latar Belakang"
          subheading="Reach Out Our Assistance"
          imgSrc={latarbelakanguser}
          code={1}
        />
        <Link
          heading="General - Posisi"
          subheading="Learn what we do here"
          imgSrc={posisi}
          code={2}
        />
        <Link
          heading="General - Softskill Situasional"
          subheading="Reach Out Our Assistance"
          imgSrc={softskill}
          code={3}
        />
        <Link
          heading="Penutup"
          subheading="Learn what we do here"
          imgSrc={Image1}
          code={4}
        />
        <Link
          heading="Kuliner dan Restoran"
          subheading="Reach Out Our Assistance"
          imgSrc={kuliner}
          code={5}
        />
        <Link
          heading="Penjualan dan Pemasaran"
          subheading="Learn what we do here"
          imgSrc={pemasaran}
          code={6}
        />
        <Link
          heading="Layanan Pelanggan"
          subheading="Reach Out Our Assistance"
          imgSrc={layananpelanggan}
          code={7}
        />
        <Link
          heading="Administrasi dan Akuntansi"
          subheading="Learn what we do here"
          imgSrc={akuntansi}
          code={8}
        />
        <Link
          heading="Design Grafis"
          subheading="Reach Out Our Assistance"
          imgSrc={designgrafis}
          code={9}
        />
        <Link
          heading="IT"
          subheading="Learn what we do here"
          imgSrc={it}
          code={10}
        />
        <Link
          heading="Keamanan"
          subheading="Reach Out Our Assistance"
          imgSrc={keamanan}
          code={11}
        />
        <Link
          heading="Kesehatan"
          subheading="Learn what we do here"
          imgSrc={kesehatan}
          code={12}
        />
        <Link
          heading="Pendidikan"
          subheading="Reach Out Our Assistance"
          imgSrc={pendidikan}
          code={13}
        />
        <Link
          heading="Hiburan"
          subheading="Learn what we do here"
          imgSrc={hiburan}
          code={14}
        />
        <Link
          heading="Perhotelan"
          subheading="Reach Out Our Assistance"
          imgSrc={perhotelan}
          code={15}
        />
      </div>
    </section>
  );
};

const Link = ({ heading, imgSrc, subheading, code}) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const top = useTransform(mouseYSpring, [0.5, -0.5], ["40%", "60%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["60%", "70%"]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const href = `/interview/${code}`;

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center justify-between border-b-2 border-neutral-700 py-4 transition-colors duration-500 hover:border-neutral-50 md:py-8"
    >
      <div>
        <motion.span
          variants={{
            initial: { x: 0 },
            whileHover: { x: -16 },
          }}
          transition={{
            type: "spring",
            staggerChildren: 0.075,
            delayChildren: 0.25,
          }}
          className="relative  block text-4xl font-bold text-neutral-500 transition-colors duration-500 group-hover:text-neutral-50 md:text-6xl"
        >
          {heading.split("").map((l, i) => (
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 16 },
              }}
              transition={{ type: "spring" }}
              className="inline-block"
              key={i}
            >
              {l}
            </motion.span>
          ))}
        </motion.span>
        <span className="relative  mt-2 block text-base text-neutral-500 transition-colors duration-500 group-hover:text-neutral-50">
          {subheading}
        </span>
      </div>

      <motion.img
      style={{
        top,
        right: 0,
        translateX: "50%",
        translateY: "-50%",
        marginRight: 20, 
      }}
 
        variants={{
          initial: { scale: 0, rotate: "-12.5deg" },
          whileHover: { scale: 1, rotate: "12.5deg" },
        }}
        transition={{ type: "spring" }}
        src={imgSrc}
        className="absolute z-0 h-24 w-32 rounded-lg object-cover md:h-48 md:w-64"
        alt={`Image representing a link for ${heading}`}
      />

      <motion.div
        variants={{
          initial: {
            x: "25%",
            opacity: 0,
          },
          whileHover: {
            x: "0%",
            opacity: 1,
          },
        }}
        transition={{ type: "spring" }}
        className="relative  p-4"
      >
        <FiArrowRight className="text-5xl text-neutral-50" />
      </motion.div>
    </motion.a>
  );
};

export default Features;