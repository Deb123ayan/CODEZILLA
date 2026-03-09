from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Event


class ReportDisruptionView(views.APIView):
    """
    POST /api/events/report/
    Admin endpoint to report social disruptions (curfew, strike, zone closure).
    These events enable workers in the affected zone to file claims.
    """
    permission_classes = [AllowAny]  # In production: IsAdminUser

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['type', 'zone', 'severity'],
            properties={
                'type': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Event type: CURFEW, STRIKE, ZONE_CLOSURE, FLOOD, WEATHER, AQI"
                ),
                'zone': openapi.Schema(type=openapi.TYPE_STRING, description="Affected zone name"),
                'severity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Severity 1-10"),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description="Details of the disruption"),
                'reported_by': openapi.Schema(type=openapi.TYPE_STRING, description="Who reported this"),
            }
        ),
        responses={201: "Event created"}
    )
    def post(self, request):
        event_type = request.data.get('type', '').upper()
        zone = request.data.get('zone')
        severity = request.data.get('severity', 5)
        description = request.data.get('description', '')
        reported_by = request.data.get('reported_by', 'admin')

        valid_types = [t[0] for t in Event.EVENT_TYPES]
        if event_type not in valid_types:
            return Response(
                {"error": f"Invalid type. Must be one of: {valid_types}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not zone:
            return Response({"error": "zone is required"}, status=status.HTTP_400_BAD_REQUEST)

        event = Event.objects.create(
            type=event_type,
            zone=zone,
            severity=int(severity),
            description=description,
            reported_by=reported_by,
        )

        return Response({
            "message": f"{event_type} event reported for zone '{zone}'",
            "event_id": str(event.event_id),
            "type": event.type,
            "zone": event.zone,
            "severity": event.severity,
            "description": event.description,
            "timestamp": event.timestamp,
        }, status=status.HTTP_201_CREATED)


class ListEventsView(views.APIView):
    """
    GET /api/events/?zone=<zone_name>
    List recent disruption events, optionally filtered by zone.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('zone', openapi.IN_QUERY, description="Filter by zone", type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: "List of events"}
    )
    def get(self, request):
        zone = request.query_params.get('zone')

        events = Event.objects.all()
        if zone:
            events = events.filter(zone__icontains=zone)

        events = events[:50].values(
            'event_id', 'type', 'zone', 'severity',
            'description', 'reported_by', 'timestamp'
        )

        return Response(list(events), status=status.HTTP_200_OK)
