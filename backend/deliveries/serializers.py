from rest_framework import serializers
from .models import Delivery

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ['id', 'status', 'worker', 'created_at', 'updated_at', 'agent_can_keep_items', 'retail_retry_deadline']
