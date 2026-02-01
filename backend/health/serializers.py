from rest_framework import serializers
from .models import HealthCamp

class HealthCampSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthCamp
        fields = '__all__'
