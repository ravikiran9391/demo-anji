document.getElementById("autoFillBtn").addEventListener("click", async () => {
  const cas = document.getElementById("casNumber").value.trim();
  if (!cas) {
    alert("Please enter CAS number");
    return;
  }

  try {
    const res = await fetch("https://demo-anji.onrender.com/api/fetch-compound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cas }),
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("productName").value = data.title;
      document.getElementById("formula").value = data.MolecularFormula;
      document.getElementById("weight").value = data.MolecularWeight;
      document.getElementById("iupac").value = data.IUPACName;
      document.getElementById("density").value = data.Density;
      document.getElementById("imagePreview").innerHTML = `
        <img src="${data.imageUrl}" width="200" style="border-radius:8px;border:1px solid #ccc;" />
      `;
    } else {
      alert("No data found for this CAS number.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Check console.");
  }
  
});