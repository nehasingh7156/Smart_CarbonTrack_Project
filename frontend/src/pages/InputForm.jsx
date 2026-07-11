import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaBolt,
  FaFire,
  FaIndustry
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL;
const months = [
  "Jan","Feb","Mar","Apr",
  "May","Jun","Jul","Aug",
  "Sep","Oct","Nov","Dec"
];

// Stable Input component (prevents focus loss)
const Input = ({
  name,
  placeholder,
  section,
  value,
  onChange,
  onFocus,
  missing,
  styles
}) => (
  <input
    type="text"
    inputMode="numeric"
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onFocus={() => onFocus(section)}
    style={{
      ...styles.input,
      ...(value && styles.inputFilled),
      ...(missing && styles.inputMissing)
    }}
  />
);

// Stable Section component
const Section = ({
  id,
  icon,
  title,
  children,
  activeSection,
  setActiveSection,
  styles
}) => (
  <section
    style={{
      ...styles.section,
      ...(activeSection === id && styles.sectionActive)
    }}
    onClick={() => setActiveSection(id)}
  >
    <div style={styles.sectionHeader}>
      {icon}
      <h2 style={styles.sectionTitle}>{title}</h2>
    </div>
    {children}
  </section>
);

export default function InputForm() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [year, setYear] = useState(currentYear);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedPlant] = useState(
  localStorage.getItem("plant") || "plant1"
);

  const [formData, setFormData] = useState({
    reportingMonth: "",
    gridPower: "",
    renewablePower: "",
    solarPower: "",
    lpg: "",
    furnaceOil: "",
    png: "",
    hsd: "",
    biomass: "",
    production: "",
    downtime: ""
  });

  const isFormComplete = Object.values(formData).every(v => v !== "");

  const handleChange = e => {
    const { name, value } = e.target;
    if (!/^[0-9]*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectMonth = index => {
    const value = `${year}-${String(index + 1).padStart(2, "0")}`;
    setFormData(prev => ({ ...prev, reportingMonth: value }));
    setShowCalendar(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isFormComplete) return;

   const plant = selectedPlant; // ← pull from state

  localStorage.setItem("plant", plant);

  const [yearValue, monthValue] = formData.reportingMonth.split("-");
  const monthNumber = parseInt(monthValue);
  const yearNumber = parseInt(yearValue);

  try {
  const response = await fetch(
      `${API_BASE}/api/carbon/entry`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      userId: plant,
      month: monthNumber,
      year: yearNumber,

    powerConsumption: {
      gridPowerKWh: Number(formData.gridPower),
      renewablePowerKWh: Number(formData.renewablePower),
      solarPowerKWh: Number(formData.solarPower)
  },

    fuelConsumption: {
     lpgKg: Number(formData.lpg),
     furnaceOilLitre: Number(formData.furnaceOil),
     pngSCM: Number(formData.png),
     hsdLitre: Number(formData.hsd),
     biomassMJ: Number(formData.biomass)
  },

    beverageProduction: Number(formData.production),
    downtimeHours: Number(formData.downtime)
})
    }
  );

  if (!response.ok) {
    throw new Error("Server returned error");
  }

  const data = await response.json();
  console.log("Saved:", data);

  navigate("/app/dashboard");

} catch (error) {
  console.error("Submit error:", error);
  alert("Error submitting data");
}
};

  return (
    <div style={styles.page}>
      <form style={styles.form} onSubmit={handleSubmit}>

        <h1 style={styles.mainTitle}>Data Entry</h1>
        <p style={styles.subtitle}>
        Enter energy and production details for emission tracking
      </p>

        {/* Reporting Month */}
        <Section
          id="month"
          icon={<FaCalendarAlt />}
          title="Reporting Month"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          styles={styles}
        >
          <div
            style={{
              ...styles.monthDisplay,
              ...(formData.reportingMonth === "" && styles.inputMissing)
            }}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {formData.reportingMonth
              ? `${months[
                  parseInt(formData.reportingMonth.split("-")[1]) - 1
                ]} ${year}`
              : "Select Month"}
          </div>

          {showCalendar && (
            <div style={styles.calendar}>
              <div style={styles.yearRow}>
                <button
                  type="button"
                  style={styles.yearBtn}
                  onClick={() => setYear(y => y - 1)}
                >
                  ◀
                </button>

                <span style={styles.yearText}>{year}</span>

                <button
                  type="button"
                  style={styles.yearBtn}
                  onClick={() => setYear(y => y + 1)}
                >
                  ▶
                </button>
              </div>

              <div style={styles.monthGrid}>
                {months.map((m, i) => (
                  <div
                    key={m}
                    style={styles.monthTile}
                    onClick={() => selectMonth(i)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Power */}
        <Section
          id="power"
          icon={<FaBolt />}
          title="Power Consumption (kWh)"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          styles={styles}
        >
          <div style={styles.grid}>
            <Input
              name="gridPower"
              placeholder="Grid Power"
              section="power"
              value={formData.gridPower}
              onChange={handleChange}
              onFocus={setActiveSection}
              missing={formData.gridPower === ""}
              styles={styles}
            />
            <Input
              name="renewablePower"
              placeholder="Renewable Power"
              section="power"
              value={formData.renewablePower}
              onChange={handleChange}
              onFocus={setActiveSection}
              missing={formData.renewablePower === ""}
              styles={styles}
            />
            <Input
              name="solarPower"
              placeholder="Solar Power"
              section="power"
              value={formData.solarPower}
              onChange={handleChange}
              onFocus={setActiveSection}
              missing={formData.solarPower === ""}
              styles={styles}
            />
          </div>
        </Section>

        {/* Fuel */}
        <Section
          id="fuel"
          icon={<FaFire />}
          title="Fuel Consumption"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          styles={styles}
        >
          <div style={styles.grid}>
            {[
              ["lpg", "LPG (kg)"],
              ["furnaceOil", "Furnace Oil (litre)"],
              ["png", "PNG (SCM)"],
              ["hsd", "HSD (litre)"],
              ["biomass", "Biomass (MJ)"]
            ].map(([name, label]) => (
              <Input
                key={name}
                name={name}
                placeholder={label}
                section="fuel"
                value={formData[name]}
                onChange={handleChange}
                onFocus={setActiveSection}
                missing={formData[name] === ""}
                styles={styles}
              />
            ))}
          </div>
        </Section>

        {/* Production */}
        <Section
          id="production"
          icon={<FaIndustry />}
          title="Production"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          styles={styles}
        >
          <div style={styles.grid}>
            <Input
              name="production"
              placeholder="Production Volume (litres)"
              section="production"
              value={formData.production}
              onChange={handleChange}
              onFocus={setActiveSection}
              missing={formData.production === ""}
              styles={styles}
            />
            <Input
              name="downtime"
              placeholder="Downtime (hours)"
              section="production"
              value={formData.downtime}
              onChange={handleChange}
              onFocus={setActiveSection}
              missing={formData.downtime === ""}
              styles={styles}
            />
          </div>
        </Section>

        {/* Submit */}
         <button
          type="submit"
          disabled={!isFormComplete}
          style={{
            ...styles.button,
            ...(isFormComplete
              ? styles.buttonActive
              : styles.buttonDisabled)
          }}
        >
          Submit Data
        </button>

      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 40,
    background: "linear-gradient(135deg,#e0f2fe,#ccfbf1,#dcfce7)",
    display: "flex",
    justifyContent: "center",
    fontFamily: "sans-serif"
  },

  form: { width: "100%", maxWidth: 1100 },

  mainTitle: {
    textAlign: "center",
    fontSize: 58,
    fontWeight: 900,
    color: "#065f46",
    marginBottom: 30
  },
   subtitle: {
    textAlign: "center",
    color: "#065f46",
    marginBottom: "35px",
    fontSize: "20px",
    opacity: 0.7
  },

  section: {
    background: "#ecfdf5",
    padding: 24,
    borderRadius: 14,
    marginBottom: 24,
    transition: "all .25s ease"
  },

  sectionActive: {
    transform: "scale(1.02)",
    boxShadow: "0 14px 28px rgba(0,0,0,.12)"
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    color: "#047857",
    fontSize: 20
  },

  sectionTitle: { fontWeight: 800 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 14
  },

  input: {
    padding: 14,
    borderRadius: 8,
    border: "1px solid #a7f3d0",
    fontSize: 16,
    background: "#d1fae5",
    color: "#064e3b",
    fontWeight: 600
  },

  inputFilled: { color: "#064e3b" },

  inputMissing: {
    border: "2px solid #ef4444"
  },

  monthDisplay: {
    padding: 14,
    borderRadius: 8,
    background: "#d1fae5",
    cursor: "pointer",
    fontWeight: 600,
    color: "#065f46"
  },

  calendar: {
    marginTop: 16,
    background: "#f0fdf4",
    padding: 16,
    borderRadius: 12
  },

  yearRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  yearBtn: {
    background: "#14b8a6",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: 700
  },

  yearText: {
    fontWeight: 800,
    color: "#0f766e"
  },

  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 8
  },

  monthTile: {
    padding: 10,
    background: "#bbf7d0",
    borderRadius: 8,
    textAlign: "center",
    cursor: "pointer",
    fontWeight: 600,
    color: "#065f46"
  },

  button: {
    width: "100%",
    padding: 18,
    fontSize: 18,
    fontWeight: 800,
    borderRadius: 12,
    border: "none",
    transition: ".2s"
  },

  buttonActive: {
    background: "#047857",
    color: "white",
    cursor: "pointer"
  },

  buttonDisabled: {
    background: "#9ca3af",
    color: "#e5e7eb",
    cursor: "not-allowed"
  }
};
