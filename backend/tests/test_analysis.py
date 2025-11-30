"""Tests for analysis service."""

import pytest

from app.services import analysis_service


def test_calculate_threshold():
    """Test threshold calculation."""
    station = {
        "id": "test",
        "attributes": {"capacity": 10},
    }
    threshold = analysis_service.calculate_threshold(station)
    assert threshold == 7

    station2 = {
        "id": "test2",
        "attributes": {"capacity": 5},
    }
    threshold2 = analysis_service.calculate_threshold(station2)
    assert threshold2 == 3


def test_is_bottleneck():
    """Test bottleneck detection."""
    station = {
        "id": "test",
        "wipCount": 8,
        "avgProcessTime": 100.0,
        "standardCT": 80.0,
        "attributes": {"capacity": 10},
    }
    assert analysis_service.is_bottleneck(station) is True

    station2 = {
        "id": "test2",
        "wipCount": 2,
        "avgProcessTime": 90.0,
        "standardCT": 80.0,
        "attributes": {"capacity": 10},
    }
    assert analysis_service.is_bottleneck(station2) is False


def test_has_quality_issue():
    """Test quality issue detection."""
    equipment = {
        "id": "test",
        "attributes": {
            "recentDefectRate24h": 3.5,
            "qualityThreshold": 3.0,
        },
    }
    assert analysis_service.has_quality_issue(equipment) is True

    equipment2 = {
        "id": "test2",
        "attributes": {
            "recentDefectRate24h": 2.0,
            "qualityThreshold": 3.0,
        },
    }
    assert analysis_service.has_quality_issue(equipment2) is False


def test_is_low_efficiency():
    """Test low efficiency detection."""
    station = {
        "id": "test",
        "oee": 70.0,
        "targetOEE": 85.0,
    }
    assert analysis_service.is_low_efficiency(station) is True

    station2 = {
        "id": "test2",
        "oee": 88.0,
        "targetOEE": 85.0,
    }
    assert analysis_service.is_low_efficiency(station2) is False


def test_get_bottleneck_stations():
    """Test getting bottleneck stations."""
    bottlenecks = analysis_service.get_bottleneck_stations()
    assert isinstance(bottlenecks, list)
    for bottleneck in bottlenecks:
        assert "id" in bottleneck
        assert "name" in bottleneck
        assert "wipCount" in bottleneck


def test_get_quality_issues():
    """Test getting quality issues."""
    issues = analysis_service.get_quality_issues()
    assert isinstance(issues, list)
    for issue in issues:
        assert "id" in issue
        assert "name" in issue
        assert "recentDefectRate24h" in issue


def test_get_efficiency_issues():
    """Test getting efficiency issues."""
    issues = analysis_service.get_efficiency_issues()
    assert isinstance(issues, list)
    for issue in issues:
        assert "id" in issue
        assert "name" in issue
        assert "actualOEE" in issue


def test_get_spaghetti_paths_statistics():
    """Test getting spaghetti paths statistics."""
    stats = analysis_service.get_spaghetti_paths_statistics(24)
    assert isinstance(stats, dict)
    assert "paths" in stats
    assert "totalPaths" in stats
    assert "maxFrequency" in stats
    assert "pathSegments" in stats
    assert isinstance(stats["paths"], list)
    assert stats["totalPaths"] >= 0


