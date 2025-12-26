import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data } = await axiosClient.get("/teams");
    setTeams(data);
  };

  const approveTeam = async (id) => {
    await axiosClient.put(`/teams/approve/${id}`);
    fetchTeams();
  };

  return (
    <div style={styles.container}>
      <h1>📋 Quản lý đội vận chuyển</h1>

      <div style={styles.list}>
        {teams.map((team) => (
          <div
            key={team._id}
            style={{
              ...styles.card,
              borderColor: team.status === "approved" ? "green" : "orange",
            }}
            onClick={() => setSelectedTeam(team)}
          >
            <h3>{team.team_name}</h3>
            <p><b>Trạng thái:</b> {team.status}</p>
            <p><b>Trưởng đội:</b> {team.owner?.full_name}</p>
            <p><b>Giá:</b> {team.price}đ</p>

            {team.status === "pending" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  approveTeam(team._id);
                }}
                style={styles.btnApprove}
              >
                ✅ Duyệt đội
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div style={styles.detail}>
          <h2>Chi tiết đội: {selectedTeam.team_name}</h2>
          <p><b>Mô tả:</b> {selectedTeam.description}</p>
          <p><b>Phương tiện:</b> {selectedTeam.vehicle_type}</p>
          <p><b>Khu vực:</b> {selectedTeam.region}</p>
          <p><b>Trạng thái:</b> {selectedTeam.status}</p>

          <h3>🧑‍🤝‍🧑 Thành viên:</h3>
          <ul>
            {selectedTeam.members?.map((m) => (
              <li key={m._id}>{m.full_name}</li>
            ))}
          </ul>

          <button onClick={() => setSelectedTeam(null)} style={styles.btnClose}>
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px" },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },
  card: {
    border: "2px solid #ccc",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    background: "#fafafa",
  },
  detail: {
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    background: "#fff",
  },
  btnApprove: {
    background: "green",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  btnClose: {
    background: "gray",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    marginTop: "10px",
    cursor: "pointer",
  },
};

export default AdminTeamsPage;
