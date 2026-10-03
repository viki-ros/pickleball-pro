import pytest
from app.models import Match
from app.scoring_engine import process_rally, undo_last_rally, get_score_call

def create_mock_match(m_type="doubles", mode="sideout", target=11, win_by=2):
    return Match(
        id=1,
        title="Test Match",
        match_type=m_type,
        scoring_mode=mode,
        target_points=target,
        win_by=win_by,
        score_team1=0,
        score_team2=0,
        serving_team=1,
        server_number=2 if (m_type == "doubles" and mode == "sideout") else 1,
        team1_player1_side="right",
        team1_player2_side="left",
        team2_player1_side="right",
        team2_player2_side="left",
        is_completed=False,
        history="[]"
    )

def test_doubles_sideout_initial_score_call():
    m = create_mock_match("doubles", "sideout")
    assert get_score_call(m) == "0 - 0 - 2"

def test_doubles_serving_team_scores():
    m = create_mock_match("doubles", "sideout")
    # Team 1 is serving. Team 1 wins rally.
    process_rally(m, winning_team=1)
    assert m.score_team1 == 1
    assert m.score_team2 == 0
    assert m.serving_team == 1
    assert m.server_number == 2
    # Team 1 players should switch sides
    assert m.team1_player1_side == "left"
    assert m.team1_player2_side == "right"
    assert get_score_call(m) == "1 - 0 - 2"

def test_doubles_sideout_rotation():
    m = create_mock_match("doubles", "sideout")
    # Starts at 0-0-2. Receiving team (Team 2) wins rally -> immediate side-out to Team 2
    process_rally(m, winning_team=2)
    assert m.score_team1 == 0
    assert m.score_team2 == 0
    assert m.serving_team == 2
    assert m.server_number == 1
    assert get_score_call(m) == "0 - 0 - 1"

    # Team 1 wins next rally -> Team 2 moves to Server 2
    process_rally(m, winning_team=1)
    assert m.serving_team == 2
    assert m.server_number == 2
    assert get_score_call(m) == "0 - 0 - 2"

    # Team 1 wins next rally -> Side-out back to Team 1
    process_rally(m, winning_team=1)
    assert m.serving_team == 1
    assert m.server_number == 1
    assert get_score_call(m) == "0 - 0 - 1"

def test_rally_scoring():
    m = create_mock_match("doubles", "rally")
    # In rally scoring, every rally awards a point
    process_rally(m, winning_team=2)
    assert m.score_team2 == 1
    assert m.serving_team == 2
    assert get_score_call(m) == "1 - 0"

def test_win_condition_and_win_by_two():
    m = create_mock_match("singles", "sideout", target=11, win_by=2)
    m.score_team1 = 10
    m.score_team2 = 10
    m.serving_team = 1

    # Team 1 scores -> 11 - 10 (not won yet because must win by 2)
    process_rally(m, winning_team=1)
    assert m.score_team1 == 11
    assert m.is_completed is False

    # Team 1 scores again -> 12 - 10 (won!)
    process_rally(m, winning_team=1)
    assert m.score_team1 == 12
    assert m.is_completed is True
    assert m.winner_team == 1

def test_undo_stack():
    m = create_mock_match("doubles", "sideout")
    process_rally(m, winning_team=1)
    assert m.score_team1 == 1
    assert m.team1_player1_side == "left"

    undo_last_rally(m)
    assert m.score_team1 == 0
    assert m.team1_player1_side == "right"
    assert get_score_call(m) == "0 - 0 - 2"
