<?php
namespace App\Enums;

enum ClientType: string
{
    case ENTREPRISE = 'entreprise';
    case PARTICULIER = 'particulier';
}