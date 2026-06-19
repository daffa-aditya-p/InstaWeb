package main

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

func main() {
	fmt.Println("==================================================")
	fmt.Println("🚀 InstaWeb Analytics Worker & API Monitor")
	fmt.Println("==================================================")
	fmt.Println("[INFO] Memulai layanan background worker...")
	fmt.Println("[INFO] Terhubung ke antrian message queue lokal.")
	
	// Cek apakah API Flask berjalan
	targetAPI := "http://localhost:5000/api/health"

	for {
		time.Sleep(3 * time.Second)
		
		fmt.Printf("[%s] [MONITOR] Melakukan pengecekan ke %s... ", time.Now().Format("15:04:05"), targetAPI)
		
		resp, err := http.Get(targetAPI)
		if err != nil {
			fmt.Println("❌ GAGAL (Backend utama mungkin belum jalan)")
		} else {
			io.Copy(io.Discard, resp.Body) // membuang response body agar connection dapat di-reuse
			resp.Body.Close()
			if resp.StatusCode == 200 {
				fmt.Println("✅ OK (API Sehat)")
				
				// Simulasi pemrosesan background job (Analytics Sync)
				fmt.Printf("[%s] [WORKER] Menyinkronkan data analitik (PageView) ke cache server...\n", time.Now().Format("15:04:05"))
				time.Sleep(1 * time.Second)
				fmt.Printf("[%s] [WORKER] Sync selesai. 0 antrian tersisa.\n", time.Now().Format("15:04:05"))
				fmt.Println("--------------------------------------------------")
			} else {
				fmt.Printf("⚠️ WARNING (Status: %d)\n", resp.StatusCode)
			}
		}
		
		// Wait 10 seconds before next ping
		time.Sleep(10 * time.Second)
	}
}
